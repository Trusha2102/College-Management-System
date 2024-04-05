import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { StaffLoan } from '../../entity/StaffLoan';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Installment } from '../../entity/Installment';

// Create StaffLoan and Installment
export const createStaffLoan = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const staffLoanRepository = queryRunner.manager.getRepository(StaffLoan);
      const newStaffLoan = staffLoanRepository.create({
        ...req.body,
        employee: req.body.employee_id,
      });
      const savedStaffLoan = await staffLoanRepository.save(newStaffLoan);

      // Fetch the saved StaffLoan record using the employee_id
      const fetchedStaffLoan = await staffLoanRepository.findOne({
        where: { employee: req.body.employee_id },
      });

      // Check if the StaffLoan record is found
      if (!fetchedStaffLoan) {
        sendError(res, 404, 'StaffLoan not found after creation');
        return;
      }

      const staffLoanId = fetchedStaffLoan.id;

      // Create Installment records
      const installmentRepository =
        queryRunner.manager.getRepository(Installment);
      const currentMonth = new Date().getMonth(); // Get current month (0-indexed)
      const currentYear = new Date().getFullYear();
      const installmentMonths = generateInstallmentMonths(
        currentMonth,
        req.body.no_of_installments,
      );
      const installmentRecords = installmentMonths.map((month) => {
        return installmentRepository.create({
          staff_loan: { id: staffLoanId },
          amount: req.body.installment_amount,
          month,
          year: getInstallmentYear(currentMonth, currentYear, month),
          status: false,
        });
      });
      await installmentRepository.save(installmentRecords);

      sendResponse(res, 201, 'StaffLoan created successfully', savedStaffLoan);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create StaffLoan', error.message);
  }
};

// Function to generate installment months
const generateInstallmentMonths = (
  currentMonth: number,
  noOfInstallments: number,
): string[] => {
  const months: string[] = [];
  for (let i = 1; i <= noOfInstallments; i++) {
    const nextMonth = (currentMonth + i) % 12; // Get next month (0-indexed)
    months.push(getMonthName(nextMonth));
  }
  return months;
};

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

// Function to get installment year
const getInstallmentYear = (
  currentMonth: number,
  currentYear: number,
  installmentMonth: string,
): string => {
  if (currentMonth + 1 >= 12) {
    return String(currentYear + 1);
  }
  return String(currentYear);
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
      const staffLoanToDelete = await staffLoanRepository.findOne({
        where: { id: +id },
      });
      if (!staffLoanToDelete) {
        sendError(res, 404, 'StaffLoan not found');
        return;
      }
      await staffLoanRepository.remove(staffLoanToDelete);
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
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const staffLoanRepository = queryRunner.manager.getRepository(StaffLoan);
      const staffLoans = await staffLoanRepository.find();
      sendResponse(res, 200, 'Success', staffLoans);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch StaffLoans', error.message);
  }
};
