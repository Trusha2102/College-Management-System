import { Request, Response } from 'express';
import { Employee } from '../../entity/Employee';
import { Designation } from '../../entity/Designation';
import { Department } from '../../entity/Department';
import { User } from '../../entity/User';
import { Role } from '../../entity/Role';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';

// Create Employee with Transaction and QueryRunner
export const createEmployee = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

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
    const departmentRepository = queryRunner.manager.getRepository(Department);

    const user = await userRepository.findOne({
      where: { id: parseInt(userId, 10) },
    });
    if (!user) {
      await queryRunner.rollbackTransaction();
      return sendError(res, 404, 'User not found');
    }

    const designation = await designationRepository.findOne({
      where: { id: parseInt(designationId, 10) },
    });
    if (!designation) {
      await queryRunner.rollbackTransaction();
      return sendError(res, 404, 'Designation not found');
    }

    const department = await departmentRepository.findOne({
      where: { id: parseInt(departmentId, 10) },
    });
    if (!department) {
      await queryRunner.rollbackTransaction();
      return sendError(res, 404, 'Department not found');
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

    await queryRunner.commitTransaction();

    sendResponse(res, 201, 'Employee created successfully', newEmployee);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    sendError(res, 500, 'Failed to create employee', error.message);
  } finally {
    await queryRunner.release();
  }
};
// List Employees
export const listEmployees = async (req: Request, res: Response) => {
  try {
    const { role, staff_id, name, department, designation } = req.query;

    let query = AppDataSource.getRepository(Employee)
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.designation', 'designation');

    if (role) {
      const roleId = await AppDataSource.getRepository(Role)
        .createQueryBuilder('role')
        .where('role.name = :role', { role })
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
      query = query.andWhere('CAST(employee.staff_id AS TEXT) LIKE :staff_id', {
        staff_id: `%${staff_id}%`,
      });
    }

    if (name) {
      query = query.andWhere(
        '(user.first_name LIKE :name OR user.last_name LIKE :name OR user.middle_name LIKE :name)',
        {
          name: `%${name}%`,
        },
      );
    }

    if (department) {
      const departmentIds = await AppDataSource.getRepository(Department)
        .createQueryBuilder('department')
        .where('department.department ILIKE :department', {
          department: `%${department}%`,
        })
        .select('department.id')
        .getRawMany();
      console.log('🚀 ~ listEmployees ~ departmentIds:', departmentIds);

      if (!departmentIds || departmentIds.length === 0) {
        return sendError(res, 400, 'Invalid department name');
      }

      const departmentIdValues = departmentIds.map(
        (dept) => dept.department_id,
      );
      console.log(
        '🚀 ~ listEmployees ~ departmentIdValues:',
        departmentIdValues,
      );

      query = query.andWhere('employee.department_id IN (:...departmentIds)', {
        departmentIds: departmentIdValues,
      });
    }

    if (designation) {
      const designationIds = await AppDataSource.getRepository(Designation)
        .createQueryBuilder('designation')
        .where('designation.designation ILIKE :designation', {
          designation: `%${designation}%`,
        })
        .select('designation.id')
        .getRawMany();

      if (!designationIds || designationIds.length === 0) {
        return sendError(res, 400, 'Invalid designation name');
      }

      const designationIdValues = designationIds.map(
        (desig) => desig.designation_id,
      );

      query = query.andWhere(
        'employee.designation_id IN (:...designationIds)',
        {
          designationIds: designationIdValues,
        },
      );
    }

    const employees = await query.getMany();
    sendResponse(res, 200, 'Employees found', employees);
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
      where: { id: parseInt(id, 10) },
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
  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    const { id } = req.params;
    const employeeRepository = queryRunner.manager.getRepository(Employee);
    const employee = await employeeRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!employee) {
      await queryRunner.rollbackTransaction();
      return sendError(res, 404, 'Employee not found');
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
    const departmentRepository = queryRunner.manager.getRepository(Department);

    if (userId) {
      const user = await userRepository.findOne({
        where: { id: parseInt(userId, 10) },
      });
      if (!user) {
        await queryRunner.rollbackTransaction();
        return sendError(res, 404, 'User not found');
      }
      employee.user = user;
    }

    if (designationId) {
      const designation = await designationRepository.findOne({
        where: { id: parseInt(designationId, 10) },
      });
      if (!designation) {
        await queryRunner.rollbackTransaction();
        return sendError(res, 404, 'Designation not found');
      }
      employee.designation = designation;
      employee.designation_id = designationId;
    }

    if (departmentId) {
      const department = await departmentRepository.findOne({
        where: { id: parseInt(departmentId, 10) },
      });
      if (!department) {
        await queryRunner.rollbackTransaction();
        return sendError(res, 404, 'Department not found');
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

    await queryRunner.commitTransaction();

    sendResponse(res, 200, 'Employee updated successfully', employee);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    sendError(res, 500, 'Failed to update employee', error.message);
  } finally {
    await queryRunner.release();
  }
};

// Delete Employee with Transaction and QueryRunner
export const deleteEmployeeById = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    const { id } = req.params;
    const employeeRepository = queryRunner.manager.getRepository(Employee);
    const employee = await employeeRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!employee) {
      await queryRunner.rollbackTransaction();
      return sendError(res, 404, 'Employee not found');
    }

    employee.is_active = false; // Soft delete by setting is_active to false
    await employeeRepository.save(employee);

    await queryRunner.commitTransaction();

    sendResponse(res, 204, 'Employee deleted successfully');
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    sendError(res, 500, 'Failed to delete employee', error.message);
  } finally {
    await queryRunner.release();
  }
};
