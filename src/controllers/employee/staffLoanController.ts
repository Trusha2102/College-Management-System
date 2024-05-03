import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { StaffLoan } from '../../entity/StaffLoan';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Installment } from '../../entity/Installment';
import { Employee } from '../../entity/Employee';
import { createActivityLog } from '../../utils/activityLog';

// Create StaffLoan and Installment
export const createStaffLoan = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();

    const employeeRepository = queryRunner.manager.getRepository(Employee);
    const employee = await employeeRepository.findOne({
      where: { id: +req.body.employee_id },
    });
    if (!employee) {
      sendError(res, 404, 'Employee not found');
      return;
    }

    await runTransaction(queryRunner, async () => {
      const staffLoanRepository = queryRunner.manager.getRepository(StaffLoan);
      const newStaffLoan = staffLoanRepository.create({
        ...req.body,
        type: 'Staff Loan',
        employee: req.body.employee_id,
      });
      const savedStaffLoan = await staffLoanRepository.save(newStaffLoan);

      // Fetch the saved StaffLoan record using the employee_id
      const fetchedStaffLoan = await staffLoanRepository.findOne({
        where: { employee: req.body.employee_id },
        order: { id: 'DESC' },
      });

      // Check if the StaffLoan record is found
      if (!fetchedStaffLoan) {
        sendError(res, 404, 'StaffLoan not found after creation');
        return;
      }

      const staffLoanId = fetchedStaffLoan.id;

      // Generate Installment records
      const installmentRepository =
        queryRunner.manager.getRepository(Installment);
      const noOfInstallments = req.body.no_of_installments;
      const installmentAmount = req.body.installment_amount;
      const currentMonth = new Date().getMonth();
      let currentYear = new Date().getFullYear();
      const installmentRecords = [];

      for (let i = 0; i < noOfInstallments; i++) {
        // Determine the month and year for the installment
        const monthIndex = (currentMonth + i) % 12;
        const monthName = getMonthName(monthIndex);
        const installmentYear = getInstallmentYear(
          currentYear,
          currentMonth,
          monthIndex,
        );

        // Create Installment record
        const installmentRecord = installmentRepository.create({
          staff_loan: { id: staffLoanId },
          amount: req.body.installment_amount,
          month: monthName,
          year: installmentYear.toString(),
          status: false,
        });

        installmentRecords.push(installmentRecord);

        // Update current year if December is encountered
        if (monthName === 'December') {
          currentYear++;
        }
      }

      await createActivityLog(
        req.user?.id || 0,
        `Staff Loan applied for Employee ${employee.user.first_name + ' ' + employee.user.last_name} of Amount: ${'Rs' + req.body.loan_amount} by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      // Save Installment records
      await installmentRepository.save(installmentRecords);

      sendResponse(res, 201, 'StaffLoan created successfully', savedStaffLoan);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create StaffLoan', error.message);
  }
};

function getInstallmentYear(
  currentYear: number,
  currentMonth: number,
  monthIndex: number,
): number {
  // If the current month is December and the next month is January,
  // increment the year
  if (currentMonth === 11 && monthIndex === 0) {
    return currentYear + 1;
  }
  // Otherwise, keep the current year
  return currentYear;
}

// Function to get month name from index
const getMonthName = (monthIndex: number): string => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return monthNames[monthIndex];
};

// Update StaffLoan by ID
export const updateStaffLoanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const staffLoanRepository = queryRunner.manager.getRepository(StaffLoan);
      const staffLoanToUpdate = await staffLoanRepository.findOne({
        where: { id: +id },
      });
      if (!staffLoanToUpdate) {
        sendError(res, 404, 'StaffLoan not found');
        return;
      }
      staffLoanRepository.merge(staffLoanToUpdate, req.body);
      const updatedStaffLoan =
        await staffLoanRepository.save(staffLoanToUpdate);

      await createActivityLog(
        req.user?.id || 0,
        `Staff Loan details updated for Employee ${staffLoanToUpdate.employee.user.first_name + ' ' + staffLoanToUpdate.employee.user.last_name} of Amount: ${'Rs' + updatedStaffLoan.loan_amount} by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(
        res,
        200,
        'StaffLoan updated successfully',
        updatedStaffLoan,
      );
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update StaffLoan', error.message);
  }
};

// Delete StaffLoan by ID
export const deleteStaffLoanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const staffLoanRepository = queryRunner.manager.getRepository(StaffLoan);
      const installmentRepository =
        queryRunner.manager.getRepository(Installment);

      // Check if the staffLoanId exists in the Installment table
      const installmentWithStaffLoan = await installmentRepository.findOne({
        where: { staff_loan: { id: +id } },
      });

      if (installmentWithStaffLoan) {
        sendError(
          res,
          400,
          'Cannot delete StaffLoan because it has associated Installments',
        );
        return;
      }

      // If not found, proceed with deleting the StaffLoan
      const staffLoanToDelete = await staffLoanRepository.findOne({
        where: { id: +id },
      });

      if (!staffLoanToDelete) {
        sendError(res, 404, 'StaffLoan not found');
        return;
      }

      await staffLoanRepository.remove(staffLoanToDelete);

      await createActivityLog(
        req.user?.id || 0,
        `Staff Loan deleted for Employee ${staffLoanToDelete.employee.user.first_name + ' ' + staffLoanToDelete.employee.user.last_name} of Amount: ${'Rs' + staffLoanToDelete.loan_amount} by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 200, 'StaffLoan deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete StaffLoan', error.message);
  }
};

// Get StaffLoan by ID
export const getStaffLoanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staffLoanRepository = AppDataSource.getRepository(StaffLoan);
    const staffLoan = await staffLoanRepository.findOne({ where: { id: +id } });
    if (!staffLoan) {
      return sendError(res, 404, 'StaffLoan not found');
    }
    sendResponse(res, 200, 'Success', staffLoan);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch StaffLoan', error.message);
  }
};

// Get all StaffLoans
export const getAllStaffLoans = async (req: Request, res: Response) => {
  try {
    const { page, limit, search, role } = req.query;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const staffLoanRepository = queryRunner.manager.getRepository(StaffLoan);

      let query = staffLoanRepository
        .createQueryBuilder('staffLoan')
        .leftJoinAndSelect('staffLoan.employee', 'employee')
        .leftJoinAndSelect('employee.user', 'user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('employee.designation', 'designation')
        .where('staffLoan.type = :type', { type: 'Staff Loan' })
        .orderBy('staffLoan.createdAt', 'DESC');

      if (search) {
        query = query.andWhere(
          '(employee.staff_id ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.father_name ILIKE :search OR designation.designation ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (role) {
        query = query.andWhere('role.name ILIKE :role', { role: `%${role}%` });
      }

      const totalCount = await query.getCount();

      let totalNoOfRecords = totalCount;
      let staffLoans: StaffLoan[] = [];

      if (page && limit) {
        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);
        const skip = (pageNumber - 1) * limitNumber;

        staffLoans = await query.skip(skip).take(limitNumber).getMany();
        totalNoOfRecords = staffLoans.length;
      } else {
        staffLoans = await query.getMany();
      }

      const modifiedStaffLoans = await Promise.all(
        staffLoans.map(async (loan) => {
          const installments = await queryRunner.manager
            .getRepository(Installment)
            .find({ where: { staff_loan: { id: loan.id }, status: false } });

          const remainingAmount = installments.reduce(
            (total, installment) => total + installment.amount,
            0,
          );

          const remainingEMIs = await queryRunner.manager
            .getRepository(Installment)
            .count({ where: { staff_loan: { id: loan.id }, status: false } });

          return {
            ...loan,
            remainingAmount,
            remainingEMIs,
          };
        }),
      );

      sendResponse(res, 200, 'Success', {
        staffLoans: modifiedStaffLoans,
        totalCount,
        totalNoOfRecords,
      });
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch StaffLoans', error.message);
  }
};
