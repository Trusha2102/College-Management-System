import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { FeesGroup } from '../../entity/FeesGroup';
import { FeesType } from '../../entity/FeesType';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';

// Create a new Fees Group
export const createFeesGroup = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const { name, description, feesTypeData } = req.body;

      // Check if feesTypeData is an array
      if (!Array.isArray(feesTypeData)) {
        throw new Error('feesTypeData should be an array');
      }

      // Create a new FeesGroup entity
      const feesGroup = new FeesGroup();
      feesGroup.name = name;
      feesGroup.description = description;

      // Save the FeesGroup entity
      const feesGroupRepository = queryRunner.manager.getRepository(FeesGroup);
      const newFeesGroup = await feesGroupRepository.save(feesGroup);

      // Check if all fees_type_ids exist
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

      // Throw error for any fees_type_id not found
      if (missingFeesTypes.length > 0) {
        throw new Error(
          `Fees Type(s) with ID(s) ${missingFeesTypes.join(', ')} not found`,
        );
      }

      // Save feesTypeData array as a string
      feesGroup.feesTypeData = JSON.stringify(feesTypeData);

      // Update the FeesGroup entity with the feesTypeData
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
    const feesGroups = await AppDataSource.manager.find(FeesGroup);
    sendResponse(res, 200, 'Fees Groups fetched successfully', feesGroups);
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
        where: { id: req.body.id },
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
      const feesGroup = await feesGroupRepository.findOne({
        where: { id: req.body.id },
      });
      if (!feesGroup) {
        sendResponse(res, 404, 'Fees Group not found');
        return;
      }
      await feesGroupRepository.remove(feesGroup);
      sendResponse(res, 200, 'Fees Group deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete Fees Group', error.message);
  }
};
