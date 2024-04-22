import { Request, Response } from 'express';
import { Designation } from '../../entity/Designation';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import { ILike } from 'typeorm';
import { Employee } from '../../entity/Employee';

// Create Designation with Transaction and QueryRunner
export const createDesignation = async (req: Request, res: Response) => {
  const { designation } = req.body;

  // Check if designation field is empty
  if (!designation) {
    return sendError(res, 400, 'Designation name cannot be empty');
  }

  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await runTransaction(queryRunner, async () => {
      const designationRepository =
        queryRunner.manager.getRepository(Designation);

      // Check if designation name already exists (case-insensitive)
      const existingDesignation = await designationRepository.findOne({
        where: { designation: ILike(designation) },
      });

      if (existingDesignation) {
        sendError(res, 400, 'Designation name already exists');
        return;
      }

      // Create new designation entity
      const newDesignation = designationRepository.create(req.body);

      // Save the new designation
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
    const { page, limit, search } = req.query;
    const designationRepository = AppDataSource.getRepository(Designation);
    let query = designationRepository.createQueryBuilder('designation');
    let designations = [];

    // Apply search filter if search query parameter is provided
    if (search) {
      query = query.where(
        'LOWER(designation.designation) LIKE LOWER(:search)',
        {
          search: `%${search}%`,
        },
      );
    }

    // Fetch total count
    const totalCount = await query.getCount();

    // If page and limit are provided, apply pagination
    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      // Fetch paginated data
      designations = await query
        .orderBy('designation.createdAt', 'DESC')
        .skip(skip)
        .take(limitNumber)
        .getMany();
    } else {
      // If page and limit are not provided, fetch all designations
      designations = await query
        .orderBy('designation.createdAt', 'DESC')
        .getMany();
    }

    sendResponse(res, 200, 'Designations found', {
      designations,
      totalNoOfRecords: designations.length,
      totalCount,
    });
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
      const employeeRepository = queryRunner.manager.getRepository(Employee);

      // Check if any employee record references the designation
      const designationHasEmployees = await employeeRepository.findOne({
        where: { designation: { id: +id } },
      });

      if (designationHasEmployees) {
        sendError(
          res,
          400,
          'Cannot delete designation as it is assigned to employees',
        );
        return; // Return to exit the function early
      }

      const designation = await designationRepository.findOne({
        where: { id: +id },
      });

      if (!designation) {
        sendError(res, 404, 'Designation not found');
        return; // Ensure to return here to exit the function early
      }

      await designationRepository.remove(designation);

      sendResponse(res, 200, 'Designation deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete designation', error.message);
  }
};
