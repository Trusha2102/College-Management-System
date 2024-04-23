import { Request, Response } from 'express';
import { Fine } from '../../entity/Fine';
import AppDataSource from '../../data-source';
import { sendError, sendResponse } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';

// Create Fine
export const createFine = async (req: Request, res: Response) => {
  try {
    await runTransaction(AppDataSource.createQueryRunner(), async () => {
      const fineRepository = AppDataSource.getRepository(Fine);
      const newFine = fineRepository.create(req.body);
      const savedFine = await fineRepository.save(newFine);
      sendResponse(res, 201, 'Fine created successfully', savedFine);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create Fine', error.message);
  }
};

// Update Fine by ID
export const updateFineById = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const fineRepository = queryRunner.manager.getRepository(Fine);
      const { id } = req.params;
      const fineToUpdate = await fineRepository.findOne({ where: { id: +id } });
      if (!fineToUpdate) {
        sendError(res, 404, 'Fine not found');
        return;
      }
      fineRepository.merge(fineToUpdate, req.body);
      const updatedFine = await fineRepository.save(fineToUpdate);
      sendResponse(res, 200, 'Fine updated successfully', updatedFine);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update Fine', error.message);
  }
};

// Delete Fine by ID
export const deleteFineById = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const fineRepository = queryRunner.manager.getRepository(Fine);
      const { id } = req.params;
      const deleteResult = await fineRepository.delete(id);
      if (deleteResult.affected === 0) {
        sendError(res, 404, 'Fine not found');
        return;
      }
      sendResponse(res, 200, 'Fine deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete Fine', error.message);
  }
};

// Get all Fines
export const getAllFines = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;
    const fineRepository = AppDataSource.getRepository(Fine);

    let query = fineRepository.createQueryBuilder('fine');

    if (search) {
      query = query.where('fine.fine_type ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const totalCount = await query.getCount();

    query = query.orderBy('fine.createdAt', 'DESC');

    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      query = query.skip(skip).take(limitNumber);
    }

    const fines = await query.getMany();

    sendResponse(res, 200, 'Fines retrieved successfully', {
      fines,
      totalNoOfRecords: fines.length,
      totalCount,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to retrieve fines', error.message);
  }
};

// Get Fine by ID
export const getFineById = async (req: Request, res: Response) => {
  try {
    const fineRepository = AppDataSource.getRepository(Fine);
    const { id } = req.params;
    const fine = await fineRepository.findOne({ where: { id: +id } });
    if (!fine) {
      sendError(res, 404, 'Fine not found');
      return;
    }
    sendResponse(res, 200, 'Fine retrieved successfully', fine);
  } catch (error: any) {
    sendError(res, 500, 'Failed to retrieve fine', error.message);
  }
};
