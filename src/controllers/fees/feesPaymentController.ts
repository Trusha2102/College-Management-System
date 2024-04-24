import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { FeesPayment } from '../../entity/FeesPayment';
import { sendError, sendResponse } from '../../utils/commonResponse';

export const getFeesPaymentByPaymentId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { payment_id } = req.params;

    if (!payment_id) {
      return sendError(res, 400, 'Payment ID is required');
    }

    const feesPaymentRepository = AppDataSource.getRepository(FeesPayment);

    const feesPayment = await feesPaymentRepository.findOne({
      where: { payment_id },
      relations: ['student', 'feesMaster'],
    });

    if (!feesPayment) {
      return sendError(res, 404, 'FeesPayment record not found');
    }

    sendResponse(res, 200, 'FeesPayment record found', feesPayment);
  } catch (error: any) {
    sendError(res, 500, 'Failed to get FeesPayment record', error.message);
  }
};

export const getPaymentByStudentId = async (req: Request, res: Response) => {
  try {
    const { student_id, fees_master_id, page, limit } = req.query;

    if (!student_id || !fees_master_id) {
      return sendError(res, 400, 'Student ID and Fees Master ID are required');
    }

    const feesPaymentRepository = AppDataSource.getRepository(FeesPayment);

    // Apply pagination
    const currentPage = page ? parseInt(page.toString()) : 1;
    const pageSize = limit ? parseInt(limit.toString()) : 10;
    const offset = limit ? (currentPage - 1) * pageSize : 0;

    const [feesPayments, totalCount] = await feesPaymentRepository.findAndCount(
      {
        where: {
          feesMaster: { id: +fees_master_id },
          student: { id: +student_id },
        },
        relations: ['feesMaster'],
        take: pageSize,
        skip: offset,
      },
    );

    if (!feesPayments || feesPayments.length === 0) {
      return sendError(res, 404, 'Fees Payment Records Not Found');
    }

    const totalNoOfRecords = feesPayments.length;

    sendResponse(res, 200, 'Fees Payment records found', {
      feesPayments,
      totalCount,
      totalNoOfRecords,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to get Payment records', error.message);
  }
};
