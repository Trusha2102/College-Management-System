// Import necessary modules and entities
import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Installment } from '../../entity/Installment';
import { sendError, sendResponse } from '../../utils/commonResponse';

// Define the GET API handler function
export const getInstallmentsByStaffLoanId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { staffLoanId } = req.params;

    if (!staffLoanId) {
      return res
        .status(400)
        .json({ success: false, message: 'StaffLoanId is required' });
    }

    const installmentRepository = AppDataSource.getRepository(Installment);

    const installments = await installmentRepository.find({
      where: { staff_loan: { id: +staffLoanId } },
    });

    sendResponse(res, 200, 'Installments retrieved successfully', installments);
  } catch (error: any) {
    // Handle errors
    console.error('Error:', error);
    sendError(res, 500, 'Failed to fetch installments', error.message);
  }
};
