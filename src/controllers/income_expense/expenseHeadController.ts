import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { ExpenseHead } from '../../entity/ExpenseHead';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';

// Create a new expense head
export const createExpenseHead = async (req: Request, res: Response) => {
  try {
    const { expense_head, description } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const expenseHeadRepository =
        queryRunner.manager.getRepository(ExpenseHead);
      const newExpenseHead = expenseHeadRepository.create({
        expense_head,
        description,
      });
      await expenseHeadRepository.save(newExpenseHead);
      sendResponse(
        res,
        201,
        'Expense head created successfully',
        newExpenseHead,
      );
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create expense head', error.message);
  }
};

// Get all expense heads
export const getAllExpenseHeads = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;
    const expenseHeadRepository = AppDataSource.getRepository(ExpenseHead);
    let query = expenseHeadRepository.createQueryBuilder('expenseHead');
    let expenseHeads = [];

    // If search term is provided, apply filtering
    if (search) {
      query = query
        .where('LOWER(expenseHead.expense_head) LIKE LOWER(:search)', {
          search: `%${search}%`,
        })
        .orWhere('LOWER(expenseHead.description) LIKE LOWER(:search)', {
          search: `%${search}%`,
        });
    }

    // Fetch total count of all records
    const totalCount = await query.getCount();

    // If page and limit are provided, apply pagination
    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      // Fetch paginated data
      expenseHeads = await query.skip(skip).take(limitNumber).getMany();
    } else {
      // If page and limit are not provided, fetch all expense heads
      expenseHeads = await query.getMany();
    }

    sendResponse(res, 200, 'Expense heads found', {
      expenseHeads,
      totalNoOfRecords: expenseHeads.length,
      totalCount,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch expense heads', error.message);
  }
};

// Get expense head by ID
export const getExpenseHeadById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const expenseHeadRepository = AppDataSource.getRepository(ExpenseHead);
    const expenseHead = await expenseHeadRepository.findOne({
      where: { id: +id },
    });
    if (!expenseHead) {
      return sendError(res, 404, 'Expense head not found');
    }
    sendResponse(res, 200, 'Success', expenseHead);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch expense head', error.message);
  }
};

// Update expense head by ID
export const updateExpenseHeadById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { expense_head, description } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const expenseHeadRepository =
        queryRunner.manager.getRepository(ExpenseHead);
      const expenseHead = await expenseHeadRepository.findOne({
        where: { id: +id },
      });
      if (!expenseHead) {
        sendError(res, 404, 'Expense head not found');
        return;
      }
      expenseHead.expense_head = expense_head || expenseHead.expense_head;
      expenseHead.description = description || expenseHead.description;
      await expenseHeadRepository.save(expenseHead);
      sendResponse(res, 200, 'Expense head updated successfully', expenseHead);
    });
  } catch (error: any) {
    sendError(res, 500, 'Expense to update expense head', error.message);
  }
};

// Delete expense head by ID
export const deleteExpenseHeadById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const expenseHeadRepository =
        queryRunner.manager.getRepository(ExpenseHead);
      const expenseHead = await expenseHeadRepository.findOne({
        where: { id: +id },
      });
      if (!expenseHead) {
        sendError(res, 404, 'Expense head not found');
        return;
      }
      await expenseHeadRepository.remove(expenseHead);
      sendResponse(res, 200, 'Expense head deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete expense head', error.message);
  }
};
