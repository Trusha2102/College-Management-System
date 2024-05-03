import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Income } from '../../entity/Income';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import configureMulter from '../../utils/multerConfig';
import { IncomeHead } from '../../entity/IncomeHead';
import multer from 'multer';
import { Repository } from 'typeorm';
import { createActivityLog } from '../../utils/activityLog';

const multerConfig = configureMulter('./uploads/Income', 2 * 1024 * 1024);

// Create a new income
export const createIncome = async (req: Request, res: Response) => {
  let queryRunner: any;
  try {
    multerConfig.single('attached_doc')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        if (err instanceof multer.MulterError) {
          return sendError(res, 400, 'File upload error: ' + err.message);
        } else {
          return sendError(res, 500, 'Failed to upload attached_doc');
        }
      }

      // Check required fields
      const requiredFields = ['income_head_id', 'name', 'amount', 'date'];
      for (const field of requiredFields) {
        if (!(field in req.body)) {
          return sendError(res, 400, `${field} is required`);
        }
      }

      // Check if the income_head_id exists in the IncomeHead table
      const incomeHeadRepository = AppDataSource.getRepository(IncomeHead);

      const existingIncomeHead = await incomeHeadRepository.findOne({
        where: { id: req.body.income_head_id },
      });
      if (!existingIncomeHead) {
        return sendError(res, 404, 'Income head not found');
      }

      queryRunner = AppDataSource.createQueryRunner();
      await runTransaction(queryRunner, async () => {
        const incomeRepository = queryRunner.manager.getRepository(Income);

        const attached_doc = req.file?.path as string | undefined;

        const newIncome = incomeRepository.create({
          income_head: existingIncomeHead,
          ...req.body,
          attached_doc,
        });
        await incomeRepository.save(newIncome);

        await createActivityLog(
          req.user?.id || 0,
          `Income record titled ${newIncome.name} of Amount: ${newIncome.amount} was created by ${req.user?.first_name + ' ' + req.user?.last_name}`,
        );

        sendResponse(res, 201, 'Income created successfully', newIncome);
      });
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create income', error.message);
  } finally {
    if (queryRunner) {
      await queryRunner.release();
    }
  }
};

//Get All Income Records
export const getAllIncomes = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;
    const incomeRepository: Repository<Income> =
      AppDataSource.getRepository(Income);

    let query = incomeRepository
      .createQueryBuilder('income')
      .leftJoinAndSelect('income.income_head', 'income_head');

    // Apply search query filter
    if (search) {
      query = query
        .where('income.name ILIKE :search', { search: `%${search}%` })
        .orWhere('income.invoice_number::text ILIKE :search', {
          search: `%${search}%`,
        })
        .orWhere('income.description ILIKE :search', { search: `%${search}%` })
        .orWhere('income.date::text ILIKE :search', { search: `%${search}%` });
    }

    // Fetch total count of all records
    const totalCount = await query.getCount();

    query = query.orderBy('income.createdAt', 'DESC');

    // If page and limit are provided, apply pagination
    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      // Fetch paginated data
      query = query.skip(skip).take(limitNumber);
    }

    // Fetch incomes
    const incomes = await query.getMany();

    sendResponse(res, 200, 'Incomes found', {
      incomes,
      totalNoOfRecords: incomes.length,
      totalCount,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch incomes', error.message);
  }
};

// Get income by ID
export const getIncomeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const incomeRepository = AppDataSource.getRepository(Income);
    const income = await incomeRepository.findOne({
      where: { id: +id },
    });
    if (!income) {
      return sendError(res, 404, 'Income not found');
    }
    sendResponse(res, 200, 'Success', income);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch income', error.message);
  }
};

// Update income by ID
export const updateIncomeById = async (req: Request, res: Response) => {
  try {
    multerConfig.single('attached_doc')(req, res, async (err: any) => {
      if (err) {
        return sendError(res, 500, 'Failed to upload attachment', err.message);
      }
      const { id } = req.params;

      const queryRunner = AppDataSource.createQueryRunner();
      await runTransaction(queryRunner, async () => {
        const incomeRepository = queryRunner.manager.getRepository(Income);
        const income = await incomeRepository.findOne({
          where: { id: +id },
        });
        if (!income) {
          sendError(res, 404, 'Income not found');
          return;
        }

        // Check if the income_head_id exists in the IncomeHead table
        const incomeHeadRepository = AppDataSource.getRepository(IncomeHead);
        const existingIncomeHead = await incomeHeadRepository.findOne({
          where: { id: req.body.income_head_id },
        });
        if (!existingIncomeHead) {
          sendError(res, 404, 'Income head not found');
          return;
        }

        // Update only the fields that are present in req.body
        Object.assign(income, { ...req.body, attached_doc: req.file?.path });
        income.income_head = existingIncomeHead;

        await incomeRepository.save(income);

        await createActivityLog(
          req.user?.id || 0,
          `Income record titled ${income.name} of Amount: ${income.amount} was updated by ${req.user?.first_name + ' ' + req.user?.last_name}`,
        );

        sendResponse(res, 200, 'Income updated successfully', income);
      });
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update income', error.message);
  }
};

// Delete income by ID
export const deleteIncomeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const incomeRepository = queryRunner.manager.getRepository(Income);
      const income = await incomeRepository.findOne({
        where: { id: +id },
      });
      if (!income) {
        sendError(res, 404, 'Income not found');
        return;
      }
      await incomeRepository.remove(income);

      await createActivityLog(
        req.user?.id || 0,
        `Income record titled ${income.name} of Amount: ${income.amount} was deleted by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 200, 'Income deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete income', error.message);
  }
};
