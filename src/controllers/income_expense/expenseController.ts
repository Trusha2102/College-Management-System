import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Expense } from '../../entity/Expense';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import configureMulter from '../../utils/multerConfig';
import { ExpenseHead } from '../../entity/ExpenseHead';
import multer from 'multer';
import { Repository } from 'typeorm';

const multerConfig = configureMulter('./uploads/Expense', 2 * 1024 * 1024);

// Create a new expense
export const createExpense = async (req: Request, res: Response) => {
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
      const requiredFields = ['expense_head_id', 'name', 'date', 'amount'];
      for (const field of requiredFields) {
        if (!(field in req.body)) {
          return sendError(res, 400, `${field} is required`);
        }
      }

      // Check if the expense_head_id exists in the ExpenseHead table
      const expenseHeadRepository = AppDataSource.getRepository(ExpenseHead);

      const existingExpenseHead = await expenseHeadRepository.findOne({
        where: { id: req.body.expense_head_id },
      });
      if (!existingExpenseHead) {
        return sendError(res, 404, 'Expense head not found');
      }

      queryRunner = AppDataSource.createQueryRunner();
      await runTransaction(queryRunner, async () => {
        const expenseRepository = queryRunner.manager.getRepository(Expense);

        const attached_doc = req.file?.path as string | undefined;

        const newExpense = expenseRepository.create({
          expense_head: existingExpenseHead,
          ...req.body,
          attached_doc,
        });
        await expenseRepository.save(newExpense);
        sendResponse(res, 201, 'Expense created successfully', newExpense);
      });
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create expense', error.message);
  } finally {
    if (queryRunner) {
      await queryRunner.release();
    }
  }
};

// Get all expenses
export const getAllExpenses = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;
    const expenseRepository: Repository<Expense> =
      AppDataSource.getRepository(Expense);

    let query = expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.expense_head', 'expense_head');

    // Apply search query filter
    if (search) {
      query = query
        .where('expense.name ILIKE :search', { search: `%${search}%` })
        .orWhere('expense.invoice_number::text ILIKE :search', {
          search: `%${search}%`,
        })
        .orWhere('expense.description ILIKE :search', { search: `%${search}%` })
        .orWhere('expense.date::text ILIKE :search', { search: `%${search}%` });
    }

    // Fetch total count of all records
    const totalCount = await query.getCount();

    query = query.orderBy('expense.createdAt', 'DESC');

    // If page and limit are provided, apply pagination
    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      // Fetch paginated data
      query = query.skip(skip).take(limitNumber);
    }

    // Fetch expenses
    const expenses = await query.getMany();

    sendResponse(res, 200, 'Expenses found', {
      expenses,
      totalNoOfRecords: expenses.length,
      totalCount,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch expenses', error.message);
  }
};

// Get expense by ID
export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const expenseRepository = AppDataSource.getRepository(Expense);
    const expense = await expenseRepository.findOne({
      where: { id: +id },
    });
    if (!expense) {
      return sendError(res, 404, 'Expense not found');
    }
    sendResponse(res, 200, 'Success', expense);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch expense', error.message);
  }
};

// Update expense by ID
export const updateExpenseById = async (req: Request, res: Response) => {
  try {
    multerConfig.single('attached_doc')(req, res, async (err: any) => {
      if (err) {
        return sendError(res, 500, 'Failed to upload attachment', err.message);
      }
      const { id } = req.params;

      const queryRunner = AppDataSource.createQueryRunner();
      await runTransaction(queryRunner, async () => {
        const expenseRepository = queryRunner.manager.getRepository(Expense);
        const expense = await expenseRepository.findOne({
          where: { id: +id },
        });
        if (!expense) {
          sendError(res, 404, 'Expense not found');
          return;
        }

        // Check if the income_head_id exists in the ExpenseHead table
        const expenseHeadRepository = AppDataSource.getRepository(ExpenseHead);
        const existingExpenseHead = await expenseHeadRepository.findOne({
          where: { id: req.body.expense_head_id },
        });
        if (!existingExpenseHead) {
          sendError(res, 404, 'Expense head not found');
          return;
        }

        // Update only the fields that are present in req.body
        Object.assign(expense, { ...req.body, attached_doc: req.file?.path });
        expense.expense_head = existingExpenseHead;

        await expenseRepository.save(expense);
        sendResponse(res, 200, 'Expense updated successfully', expense);
      });
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update expense', error.message);
  }
};

// Delete expense by ID
export const deleteExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const expenseRepository = queryRunner.manager.getRepository(Expense);
      const expense = await expenseRepository.findOne({
        where: { id: +id },
      });
      if (!expense) {
        sendError(res, 404, 'Expense not found');
        return;
      }
      await expenseRepository.remove(expense);
      sendResponse(res, 200, 'Expense deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete expense', error.message);
  }
};
