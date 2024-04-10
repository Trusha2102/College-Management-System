import { Request, Response } from 'express';
import { Employee } from '../../entity/Employee';
import { Designation } from '../../entity/Designation';
import { Department } from '../../entity/Department';
import { User } from '../../entity/User';
import { Role } from '../../entity/Role';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import bcrypt from 'bcrypt';
import configureMulter from '../../utils/multerConfig';
import multer from 'multer';

const upload = configureMulter('./uploads/profilePicture', 5 * 1024 * 1024); // 5MB limit

// Create Employee with Transaction and QueryRunner
export const createEmployee = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  try {
    await runTransaction(queryRunner, async () => {
      const {
        userId,
        staffId,
        designationId,
        departmentId,
        salary,
        deduction,
        contractType,
        doj,
        dol,
        workShift,
        workLocation,
      } = req.body;

      const employeeRepository = queryRunner.manager.getRepository(Employee);
      const userRepository = queryRunner.manager.getRepository(User);
      const designationRepository =
        queryRunner.manager.getRepository(Designation);
      const departmentRepository =
        queryRunner.manager.getRepository(Department);

      const user = await userRepository.findOne({
        where: { id: +userId },
      });
      if (!user) {
        sendError(res, 404, 'User not found');
        return; // Return here to exit the callback
      }

      const designation = await designationRepository.findOne({
        where: { id: +designationId },
      });
      if (!designation) {
        sendError(res, 404, 'Designation not found');
        return; // Return here to exit the callback
      }

      const department = await departmentRepository.findOne({
        where: { id: +departmentId },
      });
      if (!department) {
        sendError(res, 404, 'Department not found');
        return; // Return here to exit the callback
      }

      const newEmployee = employeeRepository.create({
        user,
        staff_id: staffId,
        designation,
        designation_id: designationId,
        department,
        department_id: departmentId,
        salary,
        deduction,
        contract_type: contractType,
        DOJ: doj,
        DOL: dol,
        work_shift: workShift,
        work_location: workLocation,
      });

      await employeeRepository.save(newEmployee);

      sendResponse(res, 201, 'Employee created successfully', newEmployee);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create employee', error.message);
  }
};

// List Employees
export const listEmployees = async (req: Request, res: Response) => {
  try {
    const {
      role,
      staff_id,
      name,
      department,
      designation,
      page,
      limit,
      month,
      year,
      staff_loan_search,
    } = req.query;

    const pageNumber: number = parseInt(page as string, 10) || 1;
    const itemsPerPage: number = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * itemsPerPage;

    let query = AppDataSource.getRepository(Employee)
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.designation', 'designation')
      .leftJoinAndSelect('employee.payroll', 'payroll');

    if (role) {
      // Filter by role
      const roleId = await AppDataSource.getRepository(Role)
        .createQueryBuilder('role')
        .where('role.name ILIKE :role', { role: `%${role}%` })
        .select('role.id')
        .getRawOne();

      if (!roleId) {
        return sendError(res, 400, 'Invalid role name');
      }

      query = query.andWhere('user.role_id = :roleId', {
        roleId: roleId.role_id,
      });
    }

    if (staff_id) {
      // Filter by staff_id
      query = query.andWhere(
        'CAST(employee.staff_id AS TEXT) ILIKE :staff_id',
        {
          staff_id: `%${staff_id}%`,
        },
      );
    }

    if (name) {
      // Filter by name
      query = query.andWhere(
        '(user.first_name ILIKE :name OR user.last_name ILIKE :name OR user.father_name ILIKE :name)',
        {
          name: `%${name}%`,
        },
      );
    }

    if (department) {
      // Filter by department
      const departmentId = await AppDataSource.getRepository(Department)
        .createQueryBuilder('department')
        .where('department.department ILIKE :department', {
          department: `%${department}%`,
        })
        .select('department.id')
        .getRawOne();

      if (!departmentId) {
        return sendError(res, 400, 'Invalid department name');
      }

      query = query.andWhere('employee.department_id = :departmentId', {
        departmentId: departmentId.department_id,
      });
    }

    if (designation) {
      // Filter by designation
      const designationId = await AppDataSource.getRepository(Designation)
        .createQueryBuilder('designation')
        .where('designation.designation ILIKE :designation', {
          designation: `%${designation}%`,
        })
        .select('designation.id')
        .getRawOne();

      if (!designationId) {
        return sendError(res, 400, 'Invalid designation name');
      }

      query = query.andWhere('employee.designation_id = :designationId', {
        designationId: designationId.designation_id,
      });
    }

    if (month) {
      // Filter by month
      query = query.andWhere('payroll.month ILIKE :month', { month });
    }

    if (year) {
      // Filter by year
      query = query.andWhere('payroll.year ILIKE :year', { year });
    }

    if (staff_loan_search && staff_loan_search === 'true') {
      // Filter by staff_loan_search flag
      query = query.andWhere('payroll.is_staff_loan = true');
    }

    // Order employees by created_at in descending order
    query = query.orderBy('employee.createdAt', 'DESC');

    const totalEmployees = await query.getCount();
    const totalPages = Math.ceil(totalEmployees / itemsPerPage);

    query = query.skip(skip).take(itemsPerPage);

    const employees = await query.getMany();
    sendResponse(res, 200, 'Employees found', {
      employees,
      totalEmployees,
      totalPages,
      page: pageNumber,
      limit: itemsPerPage,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch employees', error.message);
  }
};

// Get Employee by ID
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employeeRepository = AppDataSource.getRepository(Employee);
    const employee = await employeeRepository.findOne({
      where: { id: +id },
    });
    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }
    sendResponse(res, 200, 'Employee found', employee);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch employee', error.message);
  }
};

// Update Employee with Transaction and QueryRunner
export const updateEmployee = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();

  await runTransaction(queryRunner, async () => {
    try {
      const { id } = req.params;
      const employeeRepository = queryRunner.manager.getRepository(Employee);
      const employee = await employeeRepository.findOne({
        where: { id: +id },
      });
      if (!employee) {
        sendError(res, 404, 'Employee not found');
        return; // Return here to exit the callback
      }

      const {
        userId,
        staffId,
        designationId,
        departmentId,
        salary,
        deduction,
        contractType,
        doj,
        dol,
        workShift,
        workLocation,
        is_active,
      } = req.body;

      const userRepository = queryRunner.manager.getRepository(User);
      const designationRepository =
        queryRunner.manager.getRepository(Designation);
      const departmentRepository =
        queryRunner.manager.getRepository(Department);

      if (userId) {
        const user = await userRepository.findOne({
          where: { id: +userId },
        });
        if (!user) {
          sendError(res, 404, 'User not found');
          return; // Return here to exit the callback
        }
        employee.user = user;
      }

      if (designationId) {
        const designation = await designationRepository.findOne({
          where: { id: +designationId },
        });
        if (!designation) {
          sendError(res, 404, 'Designation not found');
          return; // Return here to exit the callback
        }
        employee.designation = designation;
        employee.designation_id = designationId;
      }

      if (departmentId) {
        const department = await departmentRepository.findOne({
          where: { id: +departmentId },
        });
        if (!department) {
          sendError(res, 404, 'Department not found');
          return; // Return here to exit the callback
        }
        employee.department = department;
        employee.department_id = departmentId;
      }

      if (staffId) employee.staff_id = staffId;
      if (salary) employee.salary = salary;
      if (deduction) employee.deduction = deduction;
      if (contractType) employee.contract_type = contractType;
      if (doj) employee.DOJ = doj;
      if (dol) employee.DOL = dol;
      if (workShift) employee.work_shift = workShift;
      if (workLocation) employee.work_location = workLocation;
      if (is_active) employee.is_active = is_active;

      await employeeRepository.save(employee);

      sendResponse(res, 200, 'Employee updated successfully', employee);
    } catch (error: any) {
      sendError(res, 500, 'Failed to update employee', error.message);
    }
  });
};

// Delete Employee with Transaction and QueryRunner
export const deleteEmployeeById = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();

  await runTransaction(queryRunner, async () => {
    try {
      const { id } = req.params;
      const employeeRepository = queryRunner.manager.getRepository(Employee);
      const employee = await employeeRepository.findOne({
        where: { id: +id },
      });
      if (!employee) {
        sendError(res, 404, 'Employee not found');
        return; // Return here to exit the callback
      }

      employee.is_active = false; // Soft delete by setting is_active to false
      await employeeRepository.save(employee);

      sendResponse(res, 200, 'Employee deleted successfully');
    } catch (error: any) {
      sendError(res, 500, 'Failed to delete employee', error.message);
    }
  });
};

export const createEmployeeWithUser = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  try {
    await runTransaction(queryRunner, async () => {
      upload.single('profile_picture')(req, res, async (err: any) => {
        if (err) {
          console.error(err);
          if (err instanceof multer.MulterError) {
            return sendError(res, 400, 'File upload error: ' + err.message);
          } else {
            return sendError(res, 500, 'Failed to upload profile picture');
          }
        }

        let profilePicturePath = '';
        if (req.file) {
          profilePicturePath = req.file.path;
        }
        // Extract user data from the request body
        const {
          first_name,
          last_name,
          father_name,
          mother_name,
          email,
          password,
          role_id,
          social_media_links,
          address_id,
          bank_details_id,
          mobile,
          dob,
          marital_status,
          staffId,
          designationId,
          departmentId,
          salary,
          deduction,
          contractType,
          doj,
          dol,
          workShift,
          workLocation,
          gender,
          qualification,
          work_experience,
          aadhar_card,
        } = req.body;

        // Create a user record
        let parsedSocialMediaLinks;
        const marital_status_bool = marital_status === 'true';
        if (social_media_links) {
          parsedSocialMediaLinks = social_media_links?.split(',');
        }

        const parsedAddressId = address_id === 'null' ? null : +address_id;
        const parsedBankAccountId =
          bank_details_id === 'null' ? null : +bank_details_id;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User();
        user.first_name = first_name;
        user.last_name = last_name;
        user.father_name = father_name;
        user.mother_name = mother_name;
        user.email = email;
        user.password = hashedPassword;
        user.is_active = true;
        user.marital_status = marital_status_bool;
        user.gender = gender;
        user.qualification = qualification;
        user.work_experience = work_experience;
        user.aadhar_card = aadhar_card;
        user.role_id = role_id;
        user.role = role_id;
        user.mobile = mobile;
        user.dob = new Date(dob);
        user.profile_picture = profilePicturePath;
        user.social_media_links = parsedSocialMediaLinks || null;
        user.address_id = parsedAddressId as number;
        user.bank_details_id = parsedBankAccountId as number;

        let newUser;
        await runTransaction(queryRunner, async () => {
          newUser = await queryRunner.manager.save(user);
        });

        // Create an employee record
        const designationRepository =
          queryRunner.manager.getRepository(Designation);
        const departmentRepository =
          queryRunner.manager.getRepository(Department);
        const employeeRepository = queryRunner.manager.getRepository(Employee);

        const designation = await designationRepository.findOne({
          where: { id: +designationId },
        });
        if (!designation) {
          sendError(res, 404, 'Designation not found');
          return; // Exit the callback
        }

        const department = await departmentRepository.findOne({
          where: { id: +departmentId },
        });
        if (!department) {
          sendError(res, 404, 'Department not found');
          return; // Exit the callback
        }

        const newEmployee = employeeRepository.create({
          user: newUser,
          staff_id: staffId,
          designation,
          designation_id: designationId,
          department,
          department_id: departmentId,
          salary,
          deduction,
          contract_type: contractType,
          DOJ: doj,
          DOL: dol,
          work_shift: workShift,
          work_location: workLocation,
        });

        await employeeRepository.save(newEmployee);

        sendResponse(res, 201, 'Employee created successfully', newEmployee);
      });
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create employee with user', error.message);
  }
};
