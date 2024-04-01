import express from 'express';
import * as expenseHeadController from '../../controllers/income_expense/expenseHeadController';

const router = express.Router();

router.post('/add', expenseHeadController.createExpenseHead);
router.get('/list', expenseHeadController.getAllExpenseHeads);
router.get('/:id/view', expenseHeadController.getExpenseHeadById);
router.put('/:id/update', expenseHeadController.updateExpenseHeadById);
router.delete('/:id/delete', expenseHeadController.deleteExpenseHeadById);

export default router;
