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
