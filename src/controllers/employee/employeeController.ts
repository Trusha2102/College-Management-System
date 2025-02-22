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
import { createActivityLog } from '../../utils/activityLog';

const upload = configureMulter('./uploads/profilePicture', 2 * 1024 * 1024); //2MB Limit

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
      search,
      page,
      limit,
      month,
      year,
      staff_loan_search,
      department,
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
    query = query.where('employee.is_active = :isActive', { isActive: true });

    if (role) {
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

    if (search) {
      query = query.andWhere((queryBuilder) =>
        queryBuilder
          .where('user.first_name ILIKE :search', { search: `%${search}%` })
          .orWhere('user.last_name ILIKE :search', { search: `%${search}%` })
          .orWhere('user.father_name ILIKE :search', { search: `%${search}%` })
          .orWhere('department.department ILIKE :search', {
            search: `%${search}%`,
          })
          .orWhere('designation.designation ILIKE :search', {
            search: `%${search}%`,
          })
          .orWhere('CAST(employee.staff_id AS TEXT) ILIKE :search', {
            search: `%${search}%`,
          })
          .orWhere('user.mobile ILIKE :search', { search: `%${search}%` })
          .orWhere('bank_details.pan_number ILIKE :search', {
            search: `%${search}%`,
          }),
      );
    }

    if (month) {
      // Filter by month
      query = query.andWhere('payroll.month ILIKE :month', { month });
    }

    if (year) {
      // Filter by year
      query = query.andWhere('payroll.year ILIKE :year', { year });
    }

    if (department) {
      // Filter by department using LIKE operator
      query = query.andWhere('department.department ILIKE :department', {
        department: `%${department}%`,
      });
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
      relations: ['department', 'designation', 'user', 'user.role'],
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
          return;
        }
        employee.user = user;
      }

      if (designationId) {
        const designation = await designationRepository.findOne({
          where: { id: +designationId },
        });
        if (!designation) {
          sendError(res, 404, 'Designation not found');
          return;
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
          return;
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
        relations: ['user'],
      });
      if (!employee) {
        sendError(res, 404, 'Employee not found');
        return;
      }

      employee.is_active = false;
      await employeeRepository.save(employee);

      await createActivityLog(
        req.user?.id || 0,
        `Employee named ${employee?.user.first_name + ' ' + employee?.user.last_name} with Staff ID: ${employee?.staff_id} was deleted by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

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

      const errors: string[] = [];

      // Mandatory fields
      const mandatoryFields = [
        'first_name',
        'last_name',
        'gender',
        'staffId',
        'email',
        'password',
        'mobile',
        'role_id',
        'designationId',
      ];

      for (const field of mandatoryFields) {
        if (!req.body[field]) {
          errors.push(`${field} is required and cannot be null`);
        }
      }

      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(req.body.mobile)) {
        sendError(
          res,
          400,
          'Invalid mobile number format',
          'Mobile Number should contain 10 digits',
        );
        return;
      }

      if (errors.length > 0) {
        sendError(res, 400, 'Validation errors', errors.join(', '));
        return;
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
        // const existingEmployee = await employeeRepository.findOne({
        //   where: {
        //     staff_id: staffId,
        //   },
        // });
        // if (existingEmployee) {
        //   sendError(res, 400, 'StaffId already exists');
        //   return;
        // }

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
          ...req?.body,
          password: hashedPassword,
          is_active: true,
          role: role,
          dob: req.body?.dob || null,
          marital_status: marital_status === 'true',
          profile_picture: profilePicturePath,
          social_media_links: social_media_links
            ? social_media_links.split(',')
            : null,
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
          doj: doj || null,
          dol: dol || null,
        });
        await employeeRepository.save(newEmployee);

        // Save BankAccount details
        const bankAccount = new BankAccount();
        Object.assign(bankAccount, {
          ...req.body,
          user: newUser,
          user_id: newUser.id,
          employee: newEmployee,
        });
        await bankAccountRepository.save(bankAccount);

        const displayEmployee = await employeeRepository.findOne({
          where: { staff_id: staffId },
          relations: ['user', 'designation', 'department'],
        });

        await createActivityLog(
          req.user?.id || 0,
          `Employee named ${displayEmployee?.user.first_name + ' ' + displayEmployee?.user.last_name} with Staff ID: ${displayEmployee?.staff_id} was created by ${req.user?.first_name + ' ' + req.user?.last_name}`,
        );

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
        const roleRepository = queryRunner.manager.getRepository(Role);
        const designationRepository =
          queryRunner.manager.getRepository(Designation);
        const departmentRepository =
          queryRunner.manager.getRepository(Department);

        const employee = await employeeRepository.findOne({
          where: { id: +id },
          relations: ['user', 'designation', 'department'],
        });

        if (!employee) {
          sendError(res, 404, 'Employee not found');
          return;
        }

        // Prevent specified fields from becoming null or empty string
        const nonNullableFields = [
          'first_name',
          'last_name',
          'gender',
          'staffId',
          'role_id',
          'designationId',
          'departmentId',
          'salary',
          'deduction',
          'email',
          'mobile',
        ];

        const errors: string[] = [];

        for (const field of nonNullableFields) {
          if (
            req.body[field] === null ||
            req.body[field] === undefined ||
            req.body[field] === ''
          ) {
            // Use type assertion here
            req.body[field] = employee[field as keyof Employee];
            errors.push(`${field} cannot be null or empty`);
          }
        }

        if (errors.length > 0) {
          sendError(
            res,
            400,
            'Fields cannot be null or empty',
            errors.join(', '),
          );
          return;
        }

        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(req.body.mobile)) {
          sendError(
            res,
            400,
            'Invalid mobile number format',
            'Mobile Number should contain 10 digits',
          );
          return;
        }

        const { email, role_id, staffId, designationId, departmentId } =
          req.body;

        // Check if email is already in use
        const existingUserWithEmail = await userRepository.findOne({
          where: { email: email },
        });
        if (
          existingUserWithEmail &&
          existingUserWithEmail.id !== employee.user.id
        ) {
          sendError(res, 400, 'Email already exists in another record');
          return;
        }

        // Check if role_id exists in Role table
        const role = await roleRepository.findOne({ where: { id: role_id } });
        if (!role) {
          sendError(res, 404, 'Role not found');
          return;
        }

        // Check if designationId exists in Designation table
        const designation = await designationRepository.findOne({
          where: { id: +designationId },
        });
        if (!designation) {
          sendError(res, 404, 'Designation not found');
          return;
        }

        // Check if departmentId exists in Department table
        const department = await departmentRepository.findOne({
          where: { id: +departmentId },
        });
        if (!department) {
          sendError(res, 404, 'Department not found');
          return;
        }

        let dob = employee.user.dob;
        if (req.body?.dob) {
          dob = new Date(req.body.dob);
        }

        // Update user and employee records
        Object.assign(employee.user, {
          ...req.body,
          dob: dob,
          role: role,
          profile_picture: profilePicturePath || employee.user.profile_picture,
          social_media_links: req.body.social_media_links
            ? req.body.social_media_links.split(',')
            : null,
        });

        Object.assign(employee, {
          ...req.body,
          staff_id: staffId,
          designation_id: req.body?.designationId,
          department_id: req.body?.departmentId,
          doj: req.body?.doj || employee.doj || null,
          dol: req.body?.dol || employee.dol || null,
        });

        await userRepository.save(employee.user);
        await employeeRepository.save(employee);

        await createActivityLog(
          req.user?.id || 0,
          `Employee named ${employee?.user.first_name + ' ' + employee?.user.last_name} with Staff ID: ${employee?.staff_id} was updated by ${req.user?.first_name + ' ' + req.user?.last_name}`,
        );

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
