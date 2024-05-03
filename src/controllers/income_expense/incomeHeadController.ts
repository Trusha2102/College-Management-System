import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { IncomeHead } from '../../entity/IncomeHead';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { createActivityLog } from '../../utils/activityLog';

// Create a new income head
export const createIncomeHead = async (req: Request, res: Response) => {
  try {
    const { income_head, description } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const incomeHeadRepository =
        queryRunner.manager.getRepository(IncomeHead);
      const newIncomeHead = incomeHeadRepository.create({
        income_head,
        description,
      });
      await incomeHeadRepository.save(newIncomeHead);

      await createActivityLog(
        req.user?.id || 0,
        `Income Head record titled ${newIncomeHead.income_head} was created by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );
      sendResponse(res, 201, 'Income head created successfully', newIncomeHead);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create income head', error.message);
  }
};

// Get all income heads
export const getAllIncomeHeads = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;
    const incomeHeadRepository = AppDataSource.getRepository(IncomeHead);
    let query = incomeHeadRepository.createQueryBuilder('incomeHead');

    // If search term is provided, apply filtering
    if (search) {
      query = query
        .where('LOWER(incomeHead.income_head) LIKE LOWER(:search)', {
          search: `%${search}%`,
        })
        .orWhere('LOWER(incomeHead.description) LIKE LOWER(:search)', {
          search: `%${search}%`,
        });
    }

    // Fetch total count of all records
    const totalCount = await query.getCount();

    // Add order by createdAt DESC
    query = query.orderBy('incomeHead.createdAt', 'DESC');

    // If page and limit are provided, apply pagination
    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      // Fetch paginated data
      const incomeHeads = await query.skip(skip).take(limitNumber).getMany();

      return res.status(200).json({
        status: true,
        message: 'Income heads found',
        data: {
          incomeHeads,
          totalNoOfRecords: incomeHeads.length,
          totalCount,
        },
      });
    } else {
      // If page and limit are not provided, fetch all income heads
      const incomeHeads = await query.getMany();

      return res.status(200).json({
        status: true,
        message: 'Income heads found',
        data: {
          incomeHeads,
          totalNoOfRecords: incomeHeads.length,
          totalCount,
        },
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch income heads',
      error: error.message,
    });
  }
};

// Get income head by ID
export const getIncomeHeadById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const incomeHeadRepository = AppDataSource.getRepository(IncomeHead);
    const incomeHead = await incomeHeadRepository.findOne({
      where: { id: +id },
    });
    if (!incomeHead) {
      return sendError(res, 404, 'Income head not found');
    }
    sendResponse(res, 200, 'Success', incomeHead);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch income head', error.message);
  }
};

// Update income head by ID
export const updateIncomeHeadById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { income_head, description } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const incomeHeadRepository =
        queryRunner.manager.getRepository(IncomeHead);
      const incomeHead = await incomeHeadRepository.findOne({
        where: { id: +id },
      });
      if (!incomeHead) {
        sendError(res, 404, 'Income head not found');
        return;
      }
      incomeHead.income_head = income_head || incomeHead.income_head;
      incomeHead.description = description || incomeHead.description;
      await incomeHeadRepository.save(incomeHead);

      await createActivityLog(
        req.user?.id || 0,
        `Income Head record titled ${incomeHead.income_head} was updated by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 200, 'Income head updated successfully', incomeHead);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update income head', error.message);
  }
};

// Delete income head by ID
export const deleteIncomeHeadById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const incomeHeadRepository =
        queryRunner.manager.getRepository(IncomeHead);
      const incomeHead = await incomeHeadRepository.findOne({
        where: { id: +id },
      });
      if (!incomeHead) {
        sendError(res, 404, 'Income head not found');
        return;
      }
      await incomeHeadRepository.remove(incomeHead);

      await createActivityLog(
        req.user?.id || 0,
        `Income Head record titled ${incomeHead.income_head} was deleted by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 200, 'Income head deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete income head', error.message);
  }
};
