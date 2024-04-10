// Import necessary modules and entities
import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Installment } from '../../entity/Installment';
import { sendError, sendResponse } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';

// Define the GET API handler function
export const getInstallmentsByStaffLoanId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { staffLoanId } = req.params;
    const { page, limit } = req.query;

    if (!staffLoanId) {
      return res
        .status(400)
        .json({ success: false, message: 'StaffLoanId is required' });
    }

    const installmentRepository = AppDataSource.getRepository(Installment);
    let query = installmentRepository
      .createQueryBuilder('installment')
      .where('installment.staff_loan = :staffLoanId', { staffLoanId });

    // Count total number of records
    const totalCount = await query.getCount();

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      query = query.skip(skip).take(limitNumber);
    }

    // Fetch installments
    const installments = await query.getMany();

    sendResponse(res, 200, 'Installments retrieved successfully', {
      installments,
      totalRecords: totalCount,
    });
  } catch (error: any) {
    // Handle errors
    console.error('Error:', error);
    sendError(res, 500, 'Failed to fetch installments', error.message);
  }
};

// // Create Installment
// export const createInstallment = async (req: Request, res: Response) => {
//   try {
//     await runTransaction(AppDataSource.createQueryRunner(), async () => {
//       const installmentRepository = AppDataSource.getRepository(Installment);
//       const newInstallment = installmentRepository.create(req.body);
//       const savedInstallment = await installmentRepository.save(newInstallment);

//       sendResponse(
//         res,
//         201,
//         'Installment created successfully',
//         savedInstallment,
//       );
//     });
//   } catch (error: any) {
//     sendError(res, 500, 'Failed to create Installment', error.message);
//   }
// };

// Read Installment
export const getInstallmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const installmentRepository = AppDataSource.getRepository(Installment);
    const installment = await installmentRepository.findOne({
      where: { id: +id },
    });
    if (!installment) {
      sendError(res, 404, 'Installment not found');
      return;
    }
    sendResponse(res, 200, 'Installment retrieved successfully', installment);
  } catch (error: any) {
    sendError(res, 500, 'Failed to retrieve Installment', error.message);
  }
};

// Update Installment
export const updateInstallment = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const installmentRepository = AppDataSource.getRepository(Installment);
      const { id } = req.params;
      const installmentToUpdate = await installmentRepository.findOne({
        where: { id: +id },
      });

      if (!installmentToUpdate) {
        sendError(res, 404, 'Installment not found');
        return;
      }

      installmentRepository.merge(installmentToUpdate, req.body);
      const updatedInstallment =
        await installmentRepository.save(installmentToUpdate);
      sendResponse(
        res,
        200,
        'Installment updated successfully',
        updatedInstallment,
      );
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update Installment', error.message);
  }
};

// Delete Installment
export const deleteInstallment = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const installmentRepository =
        queryRunner.manager.getRepository(Installment);
      const { id } = req.params;
      const deleteResult = await installmentRepository.delete(id);
      if (deleteResult.affected === 0) {
        sendError(res, 404, 'Installment not found');
        return;
      }
      sendResponse(res, 200, 'Installment deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete Installment', error.message);
  }
};
