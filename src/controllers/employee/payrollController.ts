import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Payroll } from '../../entity/Payroll';
import { Employee } from '../../entity/Employee';

// Get all payrolls
export const getAllPayrolls = async (req: Request, res: Response) => {
  try {
    const { month, year, name, role_id } = req.query;

    const payrollRepository = AppDataSource.getRepository(Payroll);
    const queryBuilder = payrollRepository
      .createQueryBuilder('payroll')
      .leftJoinAndSelect('payroll.employee', 'employee')
      .leftJoin('employee.user', 'user');

    if (month) {
      queryBuilder.andWhere('payroll.month ILIKE :month', {
        month: `%${month}%`,
      });
    }
    if (year) {
      queryBuilder.andWhere('payroll.year ILIKE :year', { year: `%${year}%` });
    }
    if (name) {
      queryBuilder.andWhere(
        '(user.first_name ILIKE :name OR user.last_name ILIKE :name OR user.father_name ILIKE :name)',
        { name: `%${name}%` },
      );
    }
    if (role_id) {
      queryBuilder.andWhere('user.role_id = :role_id', { role_id });
    }

    const payrolls = await queryBuilder.getMany();
    sendResponse(res, 200, 'Success', payrolls);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch payrolls', error.message);
  }
};

// Get payroll by ID
export const getPayrollById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payrollRepository = AppDataSource.getRepository(Payroll);
    const payroll = await payrollRepository.findOne({ where: { id: +id } });
    if (!payroll) {
      sendError(res, 404, 'Payroll not found');
      return;
    }
    sendResponse(res, 200, 'Success', payroll);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch payroll', error.message);
  }
};

// Create payroll
export const createPayroll = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    const { employee_id } = body;

    const employeeRepository = AppDataSource.getRepository(Employee);
    const employee = await employeeRepository.findOne({
      where: { id: employee_id },
    });
    if (!employee) {
      sendError(res, 404, 'Employee not found');
      return;
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const payrollRepository = queryRunner.manager.getRepository(Payroll);
      const newPayroll = payrollRepository.create({
        ...body,
        employee: employee,
      });
      await payrollRepository.save(newPayroll);
      sendResponse(res, 201, 'Payroll created successfully', newPayroll);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create payroll', error.message);
  }
};

// Update payroll by ID
export const updatePayrollById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payrollRepository = AppDataSource.getRepository(Payroll);
    const payrollToUpdate = await payrollRepository.findOne({
      where: { id: +id },
    });
    if (!payrollToUpdate) {
      return sendError(res, 404, 'Payroll not found');
    }

    const employeeRepository = AppDataSource.getRepository(Employee);
    const employee = await employeeRepository.findOne({
      where: { id: req.body.employee_id },
    });
    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    // Update payroll fields with those from req.body
    Object.assign(payrollToUpdate, req.body);

    // Update the employee field with the new employee
    payrollToUpdate.employee = employee;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      await payrollRepository.save(payrollToUpdate);
      sendResponse(res, 200, 'Payroll updated successfully', payrollToUpdate);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update payroll', error.message);
  }
};

// Delete payroll by ID
export const deletePayrollById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const payrollRepository = queryRunner.manager.getRepository(Payroll);
      const payroll = await payrollRepository.findOne({ where: { id: +id } });
      if (!payroll) {
        sendError(res, 404, 'Payroll not found');
        return;
      }
      await payrollRepository.delete(id);
      sendResponse(res, 200, 'Payroll deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete payroll', error.message);
  }
};
