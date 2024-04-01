import express from 'express';
import * as expenseController from '../../controllers/income_expense/expenseController';

const router = express.Router();

router.post('/add', expenseController.createExpense);
router.get('/list', expenseController.getAllExpenses);
router.get('/:id/view', expenseController.getExpenseById);
router.put('/:id/update', expenseController.updateExpenseById);
router.delete('/:id/delete', expenseController.deleteExpenseById);

export default router;
