import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Expense } from '../../entity/Expense';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import configureMulter from '../../utils/multerConfig';
import { ExpenseHead } from '../../entity/ExpenseHead';
import multer from 'multer';

const multerConfig = configureMulter('./uploads/Expense', 2 * 1024 * 1024);

// Create a new expense
export const createExpense = async (req: Request, res: Response) => {
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
          name: req.body.name,
          invoice_number: req.body.invoice_number,
          date: req.body.date,
          amount: req.body.amount,
          attached_doc,
          description: req.body.description,
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
    const { search } = req.query;
    const expenseRepository = AppDataSource.getRepository(Expense);
    let expenses: Expense[];

    if (search) {
      expenses = await expenseRepository
        .createQueryBuilder('expense')
        .where('LOWER(expense.name) LIKE LOWER(:search)', {
          search: `%${search}%`,
        })
        .orWhere('expense.invoice_number::text LIKE :search', {
          search: `%${search}%`,
        })
        .orWhere('LOWER(expense.description) LIKE LOWER(:search)', {
          search: `%${search}%`,
        })
        .orWhere('expense.date::text LIKE :search', { search: `%${search}%` })
        .getMany();
    } else {
      expenses = await expenseRepository.find();
    }

    sendResponse(res, 200, 'Success', expenses);
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
      where: { id: parseInt(id, 10) },
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
        sendError(res, 500, 'Failed to upload attachment', err.message);
        return;
      }
      const { id } = req.params;

      const queryRunner = AppDataSource.createQueryRunner();
      await runTransaction(queryRunner, async () => {
        const expenseRepository = queryRunner.manager.getRepository(Expense);
        const expense = await expenseRepository.findOne({
          where: { id: parseInt(id, 10) },
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

        expense.expense_head = existingExpenseHead;
        expense.name = req.body.name || expense.name;
        expense.invoice_number =
          req.body.invoice_number || expense.invoice_number;
        expense.date = req.body.date || expense.date;
        expense.amount = req.body.amount || expense.amount;
        expense.attached_doc = req.file ? req.file.path : expense.attached_doc;
        expense.description = req.body.description || expense.description;

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
        where: { id: parseInt(id, 10) },
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
