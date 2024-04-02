import { Request, Response } from 'express';
import { Designation } from '../../entity/Designation';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';

// Create Designation with Transaction and QueryRunner
export const createDesignation = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  try {
    await runTransaction(queryRunner, async () => {
      const designationRepository =
        queryRunner.manager.getRepository(Designation);
      const newDesignation = designationRepository.create(req.body);
      await designationRepository.save(newDesignation);

      sendResponse(
        res,
        201,
        'Designation created successfully',
        newDesignation,
      );
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create designation', error.message);
  }
};

// Get All Designations
export const listDesignations = async (req: Request, res: Response) => {
  try {
    const designationRepository = AppDataSource.getRepository(Designation);
    const designations = await designationRepository.find();
    sendResponse(res, 200, 'Designations found', designations);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch designations', error.message);
  }
};

// Get Designation by ID
export const getDesignationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const designationRepository = AppDataSource.getRepository(Designation);
    const designation = await designationRepository.findOne({
      where: { id: +id },
    });
    if (!designation) {
      return sendError(res, 404, 'Designation not found');
    }
    sendResponse(res, 200, 'Designation found', designation);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch designation', error.message);
  }
};

// Update Designation with Transaction and QueryRunner
export const updateDesignation = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  try {
    await runTransaction(queryRunner, async () => {
      const { id } = req.params;
      const designationRepository =
        queryRunner.manager.getRepository(Designation);
      const designation = await designationRepository.findOne({
        where: { id: +id },
      });
      if (!designation) {
        sendError(res, 404, 'Designation not found');
        return; // Ensure to return here to exit the function early
      }
      designationRepository.merge(designation, req.body);
      await designationRepository.save(designation);

      sendResponse(res, 200, 'Designation updated successfully', designation);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update designation', error.message);
  }
};

// Delete Designation by ID with Transaction and QueryRunner
export const deleteDesignationById = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  try {
    await runTransaction(queryRunner, async () => {
      const { id } = req.params;
      const designationRepository =
        queryRunner.manager.getRepository(Designation);
      const designation = await designationRepository.findOne({
        where: { id: +id },
      });
      if (!designation) {
        sendError(res, 404, 'Designation not found');
        return; // Ensure to return here to exit the function early
      }
      await designationRepository.remove(designation);

      sendResponse(res, 204, 'Designation deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete designation', error.message);
  }
};
