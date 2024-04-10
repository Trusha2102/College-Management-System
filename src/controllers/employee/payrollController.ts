import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Payroll } from '../../entity/Payroll';
import { Employee } from '../../entity/Employee';
import { StaffLoan } from '../../entity/StaffLoan';
import { Installment } from '../../entity/Installment';

// Get all payrolls
export const getAllPayrolls = async (req: Request, res: Response) => {
  try {
    const { month, year, name, role_id, is_deduction_collected, page, limit } =
      req.query;

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
    if (is_deduction_collected !== undefined) {
      queryBuilder.andWhere(
        'payroll.is_deduction_collected = :is_deduction_collected',
        { is_deduction_collected },
      );
    }

    // Apply pagination if page and limit are provided
    let totalRecords = 0;
    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      queryBuilder.skip(skip).take(limitNumber);
    }
    totalRecords = await queryBuilder.getCount();
    const payrolls = await queryBuilder.getMany();
    sendResponse(res, 200, 'Success', {
      payrolls,
      totalRecords,
    });
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
    const { employee_id, deduction, month, year } = body;

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
      // Create record in StaffLoan table
      const staffLoanRepository = queryRunner.manager.getRepository(StaffLoan);
      const newStaffLoan = staffLoanRepository.create({
        employee: employee,
        loan_amount: deduction,
        no_of_installments: 1,
        installment_amount: deduction,
        status: 'Pending',
        action_by: 0,
      });
      await staffLoanRepository.save(newStaffLoan);

      // Create record in Installment table
      const installmentRepository =
        queryRunner.manager.getRepository(Installment);
      const newInstallment = installmentRepository.create({
        staff_loan: newStaffLoan,
        pay_date: null as any,
        amount: deduction,
        month: month,
        year: year,
        status: false,
      });
      await installmentRepository.save(newInstallment);

      // Create record in Payroll table
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
      // Save the updated payroll
      await payrollRepository.save(payrollToUpdate);

      // Check if deduction is collected
      if (req.body.is_deduction_collected) {
        // Update StaffLoan
        const staffLoanRepository =
          queryRunner.manager.getRepository(StaffLoan);
        const staffLoan = await staffLoanRepository.findOne({
          where: { employee: req.body.employee_id },
        });
        if (staffLoan) {
          staffLoan.status = 'Paid';
          staffLoan.collected_on_date = req.body.deduction_collected_on_date;
          await staffLoanRepository.save(staffLoan);
        }

        // Update Installment
        const installmentRepository =
          queryRunner.manager.getRepository(Installment);
        const installment = await installmentRepository.findOne({
          where: { staff_loan: staffLoan || undefined },
        });
        if (installment) {
          installment.status = true;
          installment.pay_date = req.body.deduction_collected_on_date;
          await installmentRepository.save(installment);
        }
      }

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
