import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { FeesGroup } from '../../entity/FeesGroup';
import { FeesType } from '../../entity/FeesType';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { FeesMaster } from '../../entity/FeesMaster';

// Create a new Fees Group
export const createFeesGroup = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const { name, description, feesTypeData, due_date } = req.body;

      if (!Array.isArray(feesTypeData)) {
        throw new Error('feesTypeData should be an array');
      }

      const feesGroup = new FeesGroup();
      feesGroup.name = name;
      feesGroup.description = description;
      feesGroup.due_date = due_date;

      const feesGroupRepository = queryRunner.manager.getRepository(FeesGroup);
      const newFeesGroup = await feesGroupRepository.save(feesGroup);

      const feesTypeRepository = queryRunner.manager.getRepository(FeesType);
      const missingFeesTypes: number[] = [];

      for (const item of feesTypeData) {
        const existingFeesType = await feesTypeRepository.findOne({
          where: { id: item.fees_type_id },
        });
        if (!existingFeesType) {
          missingFeesTypes.push(item.fees_type_id);
        }
      }

      if (missingFeesTypes.length > 0) {
        throw new Error(
          `Fees Type(s) with ID(s) ${missingFeesTypes.join(', ')} not found`,
        );
      }

      feesGroup.feesTypeData = JSON.stringify(feesTypeData);

      await feesGroupRepository.save(newFeesGroup);

      sendResponse(res, 201, 'Fees Group created successfully', newFeesGroup);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create Fees Group', error.message);
  }
};

// Get all Fees Groups
export const getAllFeesGroups = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;

    // Calculate offset based on page and limit parameters
    const offset = page
      ? parseInt(page as string) * (limit ? parseInt(limit as string) : 10)
      : 0;
    const take = limit ? parseInt(limit as string) : 10;

    // Fetch fees groups with pagination
    const [feesGroups, totalCount] = await AppDataSource.manager.findAndCount(
      FeesGroup,
      {
        skip: offset,
        take,
      },
    );

    // Calculate total number of records on the current page
    const totalNoOfRecords = feesGroups.length;

    sendResponse(res, 200, 'Fees Groups fetched successfully', {
      feesGroups,
      totalCount,
      totalNoOfRecords,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch Fees Groups', error.message);
  }
};

// Get Fees Group by ID
export const getFeesGroupById = async (req: Request, res: Response) => {
  try {
    const feesGroup = await AppDataSource.manager.findOne(FeesGroup, {
      where: { id: req.body.id },
    });
    if (!feesGroup) {
      return sendResponse(res, 404, 'Fees Group not found');
    }
    sendResponse(res, 200, 'Fees Group fetched successfully', feesGroup);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch Fees Group', error.message);
  }
};

// Update Fees Group by ID
export const updateFeesGroupById = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const feesGroupRepository = queryRunner.manager.getRepository(FeesGroup);
      let feesGroup = await feesGroupRepository.findOne({
        where: { id: +req.params.id },
      });
      if (!feesGroup) {
        sendResponse(res, 404, 'Fees Group not found');
        return;
      }
      feesGroupRepository.merge(feesGroup, req.body);
      const updatedFeesGroup = await feesGroupRepository.save(feesGroup);
      sendResponse(
        res,
        200,
        'Fees Group updated successfully',
        updatedFeesGroup,
      );
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update Fees Group', error.message);
  }
};

// Delete Fees Group by ID
export const deleteFeesGroupById = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const feesGroupRepository = queryRunner.manager.getRepository(FeesGroup);
      const feesMasterRepository =
        queryRunner.manager.getRepository(FeesMaster);

      const { id } = req.params;

      const feesGroup = await feesGroupRepository.findOne({
        where: { id: +id },
      });
      if (!feesGroup) {
        sendResponse(res, 404, 'Fees Group not found');
        return;
      }

      const feesMastersWithFeesGroup = await feesMasterRepository.find({
        where: { fees_group_id: +id },
      });

      if (feesMastersWithFeesGroup.length > 0) {
        sendError(
          res,
          400,
          'Fees Group cannot be deleted because it is associated with Fees Masters',
        );
        return;
      }

      await feesGroupRepository.remove(feesGroup);
      sendResponse(res, 200, 'Fees Group deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete Fees Group', error.message);
  }
};
