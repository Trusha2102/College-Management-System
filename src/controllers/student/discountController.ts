import { Request, Response } from 'express';
import { Discount } from '../../entity/Discount';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import { createActivityLog } from '../../utils/activityLog';

export const createDiscount = async (req: Request, res: Response) => {
  try {
    const { name, discount_code } = req.body;
    const queryRunner = AppDataSource.createQueryRunner();

    await runTransaction(queryRunner, async () => {
      const discountRepository = AppDataSource.getRepository(Discount);
      const newDiscount = discountRepository.create({ name, discount_code });
      await discountRepository.save(newDiscount);

      await createActivityLog(
        req.user?.id || 0,
        `Discount titled ${newDiscount.name} was created by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 201, 'Discount created successfully', newDiscount);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create discount', error);
  }
};

export const updateDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, discount_code } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();

    await runTransaction(queryRunner, async () => {
      const discountRepository = AppDataSource.getRepository(Discount);
      const existingDiscount = await discountRepository.findOne({
        where: { id: +id },
      });

      if (!existingDiscount) {
        sendError(res, 404, 'Discount not found');
        return;
      }

      existingDiscount.name = name || existingDiscount.name;
      existingDiscount.discount_code =
        discount_code || existingDiscount.discount_code;

      await discountRepository.save(existingDiscount);

      await createActivityLog(
        req.user?.id || 0,
        `Discount titled ${existingDiscount.name} was updated by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 200, 'Discount updated successfully', existingDiscount);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update discount', error);
  }
};

export const deleteDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();

    await runTransaction(queryRunner, async () => {
      const discountRepository = AppDataSource.getRepository(Discount);
      const existingDiscount = await discountRepository.findOne({
        where: { id: +id },
      });

      if (!existingDiscount) {
        sendError(res, 404, 'Discount not found');
        return;
      }

      await discountRepository.remove(existingDiscount);

      await createActivityLog(
        req.user?.id || 0,
        `Discount titled ${existingDiscount.name} was deleted by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 200, 'Discount deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete discount', error);
  }
};

export const getDiscountById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const discountRepository = AppDataSource.getRepository(Discount);

    const discount = await discountRepository.findOne({
      where: { id: +id },
    });

    if (!discount) {
      return sendError(res, 404, 'Discount not found');
    }

    sendResponse(res, 200, 'Discount found', discount);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch discount', error);
  }
};

export const getAllDiscounts = async (req: Request, res: Response) => {
  try {
    const discountRepository = AppDataSource.getRepository(Discount);

    const discounts = await discountRepository.find();

    sendResponse(res, 200, 'Discounts found', discounts);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch discounts', error);
  }
};
