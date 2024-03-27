import { Request, Response } from 'express';
import { Designation } from '../../entity/Designation';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';

// Create Designation
export const createDesignation = async (req: Request, res: Response) => {
  try {
    const { designation } = req.body;
    const designationRepository = AppDataSource.getRepository(Designation);
    const newDesignation = designationRepository.create({ designation });
    await designationRepository.save(newDesignation);
    sendResponse(res, 201, 'Designation created successfully', newDesignation);
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
      where: { id: parseInt(id, 10) },
    });
    if (!designation) {
      return sendError(res, 404, 'Designation not found');
    }
    sendResponse(res, 200, 'Designation found', designation);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch designation', error.message);
  }
};

// Update Designation
export const updateDesignation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { designation } = req.body;
    const designationRepository = AppDataSource.getRepository(Designation);
    const existingDesignation = await designationRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!existingDesignation) {
      return sendError(res, 404, 'Designation not found');
    }
    designationRepository.merge(existingDesignation, { designation });
    await designationRepository.save(existingDesignation);
    sendResponse(
      res,
      200,
      'Designation updated successfully',
      existingDesignation,
    );
  } catch (error: any) {
    sendError(res, 500, 'Failed to update designation', error.message);
  }
};

// Delete Designation by ID
export const deleteDesignationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const designationRepository = AppDataSource.getRepository(Designation);
    const designation = await designationRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!designation) {
      return sendError(res, 404, 'Designation not found');
    }
    await designationRepository.remove(designation);
    sendResponse(res, 204, 'Designation deleted successfully');
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete designation', error.message);
  }
};
