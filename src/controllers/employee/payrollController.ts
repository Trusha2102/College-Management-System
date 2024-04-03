import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Payroll } from '../../entity/Payroll';
import { Employee } from '../../entity/Employee';

// Get all payrolls
// export const getAllPayrolls = async (req: Request, res: Response) => {
//   try {
//     const payrollRepository = getRepository(Payroll);
//     const payrolls = await payrollRepository.find();
//     sendResponse(res, 200, 'Success', payrolls);
//   } catch (error: any) {
//     sendError(res, 500, 'Failed to fetch payrolls', error.message);
//   }
// };

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

      const payroll = await payrollRepository.findOne({ where: { id: +id } });
      if (!payroll) {
        sendError(res, 404, 'Payroll not found');
        return;
      }
      payrollRepository.merge(payroll, body, employee);
      const updatedPayroll = await payrollRepository.save(payroll);
      sendResponse(res, 200, 'Payroll updated successfully', updatedPayroll);
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
