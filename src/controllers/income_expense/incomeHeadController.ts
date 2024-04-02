import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { IncomeHead } from '../../entity/IncomeHead';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';

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
      sendResponse(res, 201, 'Income head created successfully', newIncomeHead);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create income head', error.message);
  }
};

// Get all income heads
export const getAllIncomeHeads = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const incomeHeadRepository = AppDataSource.getRepository(IncomeHead);
    let incomeHeads: IncomeHead[];

    if (search) {
      incomeHeads = await incomeHeadRepository
        .createQueryBuilder('incomeHead')
        .where('LOWER(incomeHead.income_head) LIKE LOWER(:search)', {
          search: `%${search}%`,
        })
        .orWhere('LOWER(incomeHead.description) LIKE LOWER(:search)', {
          search: `%${search}%`,
        })
        .getMany();
    } else {
      incomeHeads = await incomeHeadRepository.find();
    }

    sendResponse(res, 200, 'Success', incomeHeads);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch income heads', error.message);
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
      sendResponse(res, 200, 'Income head deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete income head', error.message);
  }
};
