import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Income } from '../../entity/Income';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import configureMulter from '../../utils/multerConfig';
import { IncomeHead } from '../../entity/IncomeHead';
import multer from 'multer';

const multerConfig = configureMulter('./uploads/Income', 2 * 1024 * 1024);

// Create a new income
export const createIncome = async (req: Request, res: Response) => {
  let queryRunner: any;
  try {
    multerConfig.single('attached_doc')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        if (err instanceof multer.MulterError) {
          sendError(res, 400, 'File upload error: ' + err.message);
          return;
        } else {
          sendError(res, 500, 'Failed to upload attached_doc');
          return;
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
          name: req.body.name,
          invoice_number: req.body.invoice_number,
          date: req.body.date,
          amount: req.body.amount,
          attached_doc,
          description: req.body.description,
        });
        await incomeRepository.save(newIncome);
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

// Get all incomes
export const getAllIncomes = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const incomeRepository = AppDataSource.getRepository(Income);
    let incomes: Income[];

    if (search) {
      incomes = await incomeRepository
        .createQueryBuilder('income')
        .where('LOWER(income.name) LIKE LOWER(:search)', {
          search: `%${search}%`,
        })
        .orWhere('income.invoice_number::text LIKE :search', {
          search: `%${search}%`,
        })
        .orWhere('LOWER(income.description) LIKE LOWER(:search)', {
          search: `%${search}%`,
        })
        .orWhere('income.date::text LIKE :search', { search: `%${search}%` })
        .getMany();
    } else {
      incomes = await incomeRepository.find();
    }

    sendResponse(res, 200, 'Success', incomes);
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
      where: { id: parseInt(id, 10) },
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
        sendError(res, 500, 'Failed to upload attachment', err.message);
        return;
      }
      const { id } = req.params;

      const queryRunner = AppDataSource.createQueryRunner();
      await runTransaction(queryRunner, async () => {
        const incomeRepository = queryRunner.manager.getRepository(Income);
        const income = await incomeRepository.findOne({
          where: { id: parseInt(id, 10) },
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

        income.income_head = existingIncomeHead;
        income.name = req.body.name || income.name;
        income.invoice_number =
          req.body.invoice_number || income.invoice_number;
        income.date = req.body.date || income.date;
        income.amount = req.body.amount || income.amount;
        income.attached_doc = req.file ? req.file.path : income.attached_doc;
        income.description = req.body.description || income.description;

        await incomeRepository.save(income);
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
        where: { id: parseInt(id, 10) },
      });
      if (!income) {
        sendError(res, 404, 'Income not found');
        return;
      }
      await incomeRepository.remove(income);
      sendResponse(res, 200, 'Income deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete income', error.message);
  }
};
