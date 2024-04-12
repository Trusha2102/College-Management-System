import { Request, Response } from 'express';
import runTransaction from '../../utils/runTransaction';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { FeesType } from '../../entity/FeesType';

// Create FeesType
export const createFeesType = async (req: Request, res: Response) => {
  try {
    await runTransaction(AppDataSource.createQueryRunner(), async () => {
      const feesTypeRepository = AppDataSource.getRepository(FeesType);
      const newFeesType = feesTypeRepository.create(req.body);
      const savedFeesType = await feesTypeRepository.save(newFeesType);
      sendResponse(res, 201, 'FeesType created successfully', savedFeesType);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create FeesType', error.message);
  }
};

// Update FeesType by ID
export const updateFeesType = async (req: Request, res: Response) => {
  try {
    await runTransaction(AppDataSource.createQueryRunner(), async () => {
      const feesTypeRepository = AppDataSource.getRepository(FeesType);
      const { id } = req.params;
      const updateResult = await feesTypeRepository.update(id, req.body);
      if (updateResult.affected === 0) {
        sendError(res, 404, 'FeesType not found');
        return;
      }
      const updatedFeesType = await feesTypeRepository.findOne({
        where: { id: +id },
      });
      sendResponse(res, 200, 'FeesType updated successfully', updatedFeesType);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update FeesType', error.message);
  }
};

// Delete FeesType by ID
export const deleteFeesType = async (req: Request, res: Response) => {
  try {
    await runTransaction(AppDataSource.createQueryRunner(), async () => {
      const feesTypeRepository = AppDataSource.getRepository(FeesType);
      const { id } = req.params;
      const deleteResult = await feesTypeRepository.delete(id);
      if (deleteResult.affected === 0) {
        sendError(res, 404, 'FeesType not found');
        return;
      }
      sendResponse(res, 200, 'FeesType deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete FeesType', error.message);
  }
};

// Get all FeesTypes
export const getAllFeesTypes = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;

    const feesTypeRepository = AppDataSource.getRepository(FeesType);
    let query = feesTypeRepository.createQueryBuilder('feesType');

    // Count total number of records
    const totalCount = await query.getCount();

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      query = query.skip(skip).take(limitNumber);
    }

    // Fetch fees types
    const allFeesTypes = await query
      .orderBy('feesType.createdAt', 'DESC')
      .getMany();

    const totalNoOfRecords = allFeesTypes.length;

    sendResponse(res, 200, 'FeesTypes fetched successfully', {
      feesTypes: allFeesTypes,
      totalNoOfRecords,
      totalCount,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch FeesTypes', error.message);
  }
};

// Get FeesType by ID
export const getFeesTypeById = async (req: Request, res: Response) => {
  try {
    const feesTypeRepository = AppDataSource.getRepository(FeesType);
    const { id } = req.params;
    const feesType = await feesTypeRepository.findOne({ where: { id: +id } });
    if (!feesType) {
      sendError(res, 404, 'FeesType not found');
      return;
    }
    sendResponse(res, 200, 'FeesType fetched successfully', feesType);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch FeesType', error.message);
  }
};
