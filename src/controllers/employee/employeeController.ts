import { Request, Response, query } from 'express';
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
import { BankAccount } from '../../entity/BankAccount';

const upload = configureMulter('./uploads/profilePicture', 2 * 1024 * 1024); // 2MB limit

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
        doj: doj,
        dol: dol,
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
      .leftJoinAndSelect('employee.payroll', 'payroll')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('employee.bank_details', 'bank_details');

    // // Select role name
    query.addSelect('role.name');

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

    const totalNoOfRecords = employees.length;

    sendResponse(res, 200, 'Employees found', {
      employees,
      totalEmployees,
      totalNoOfRecords,
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
      if (doj) employee.doj = doj;
      if (dol) employee.dol = dol;
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

//Create Employee and User Record together
export const createEmployeeWithUser = async (req: Request, res: Response) => {
  try {
    upload.single('profile_picture')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        if (err instanceof multer.MulterError) {
          sendError(res, 400, 'File upload error: ' + err.message);
          return;
        } else {
          sendError(res, 500, 'Failed to upload profile picture');
          return;
        }
      }

      let profilePicturePath = '';
      if (req.file) {
        profilePicturePath = req.file.path;
      }
      const queryRunner = AppDataSource.createQueryRunner();

      await runTransaction(queryRunner, async () => {
        const userRepository = queryRunner.manager.getRepository(User);
        const roleRepository = queryRunner.manager.getRepository(Role);
        const designationRepository =
          queryRunner.manager.getRepository(Designation);
        const departmentRepository =
          queryRunner.manager.getRepository(Department);
        const employeeRepository = queryRunner.manager.getRepository(Employee);
        const bankAccountRepository =
          queryRunner.manager.getRepository(BankAccount);

        const {
          email,
          password,
          role_id,
          social_media_links,
          address_id,
          bank_details_id,
          dob,
          marital_status,
          staffId,
          designationId,
          departmentId,
          doj,
          dol,
        } = req.body;

        // Check if role_id exists in Role table
        const role = await roleRepository.findOne({ where: { id: role_id } });
        if (!role) {
          sendError(res, 404, 'Role not found');
          return;
        }

        // Check if staffId and email already exists
        const existingEmployee = await employeeRepository.findOne({
          where: {
            staff_id: staffId,
          },
        });
        if (existingEmployee) {
          sendError(res, 400, 'StaffId already exists');
          return;
        }

        const existingUser = await userRepository.findOne({
          where: { email: email },
        });
        if (existingUser) {
          sendError(res, 400, 'Email already exists');
          return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User();

        Object.assign(user, {
          ...req.body,
          password: hashedPassword,
          is_active: true,
          marital_status: marital_status === 'true',
          dob: new Date(dob),
          profile_picture: profilePicturePath,
          social_media_links: social_media_links
            ? social_media_links.split(',')
            : null,
          address_id: address_id === 'null' ? 0 : +address_id,
          bank_details_id: bank_details_id === 'null' ? 0 : +bank_details_id,
        });

        const newUser = await userRepository.save(user);

        const designation = await designationRepository.findOne({
          where: { id: +designationId },
        });
        if (!designation) {
          sendError(res, 404, 'Designation not found');
          return;
        }

        const department = await departmentRepository.findOne({
          where: { id: +departmentId },
        });
        if (!department) {
          sendError(res, 404, 'Department not found');
          return;
        }

        const newEmployee = employeeRepository.create({
          user: newUser,
          staff_id: staffId,
          designation,
          designation_id: designationId,
          department,
          department_id: departmentId,
          ...req.body,
          doj: new Date(doj) || null,
          dol: dol || '',
        });
        await employeeRepository.save(newEmployee);

        // Save BankAccount details
        const bankAccount = new BankAccount();
        Object.assign(bankAccount, {
          ...req.body,
          pan_number: +req.body.pan_number,
          ifsc: +req.body.ifsc,
          user: newUser,
          user_id: newUser.id,
          employee: newEmployee,
        });
        await bankAccountRepository.save(bankAccount);

        const displayEmployee = await employeeRepository.findOne({
          where: { staff_id: staffId },
        });

        sendResponse(
          res,
          201,
          'Employee created successfully',
          displayEmployee,
        );
      });
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create employee with user', error.message);
  }
};

//Update Employee and User Record together
export const updateEmployeeWithUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Handle file upload
    upload.single('profile_picture')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        if (err instanceof multer.MulterError) {
          sendError(res, 400, 'File upload error: ' + err.message);
          return;
        } else {
          sendError(res, 500, 'Failed to upload profile picture');
          return;
        }
      }

      let profilePicturePath = '';
      if (req.file) {
        profilePicturePath = req.file.path;
      }

      const queryRunner = AppDataSource.createQueryRunner();

      await runTransaction(queryRunner, async () => {
        const userRepository = queryRunner.manager.getRepository(User);
        const employeeRepository = queryRunner.manager.getRepository(Employee);

        const employee = await employeeRepository.findOne({
          where: { id: +id },
          relations: ['user'],
        });

        if (!employee) {
          sendError(res, 404, 'Employee not found');
          return;
        }

        // Update user and employee records
        Object.assign(employee.user, {
          ...req.body,
          password: req.body.password
            ? await bcrypt.hash(req.body.password, 10)
            : employee.user.password,
          dob: new Date(req.body.dob),
          profile_picture: profilePicturePath || employee.user.profile_picture,
          social_media_links: req.body.social_media_links
            ? req.body.social_media_links.split(',')
            : null,
          address_id: req.body.address_id === 'null' ? 0 : +req.body.address_id,
          bank_details_id:
            req.body.bank_details_id === 'null' ? 0 : +req.body.bank_details_id,
        });

        Object.assign(employee, {
          ...req.body,
          designation_id: req.body.designationId,
          department_id: req.body.departmentId,
          doj: new Date(req.body.doj) || null,
          dol: req.body.dol || '',
        });

        await userRepository.save(employee.user);
        await employeeRepository.save(employee);

        // Send success response
        sendResponse(res, 200, 'Employee updated successfully', employee);
      });
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update employee with user', error.message);
  }
};

export const listRoleDepDes = async (req: Request, res: Response) => {
  try {
    // Fetch all records from the Role table
    const roleRepository = AppDataSource.getRepository(Role);
    const roles = await roleRepository.find();

    // Fetch all records from the Department table
    const departmentRepository = AppDataSource.getRepository(Department);
    const departments = await departmentRepository.find();

    // Fetch all records from the Designation table
    const designationRepository = AppDataSource.getRepository(Designation);
    const designations = await designationRepository.find();

    // Return the fetched records as a response
    res.json({ roles, departments, designations });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ message: 'Failed to fetch records' });
  }
};
