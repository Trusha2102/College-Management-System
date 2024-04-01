import express from 'express';
import * as expenseHeadController from '../../controllers/income_expense/expenseHeadController';

const router = express.Router();

router.post('/add', expenseHeadController.createExpenseHead);
router.get('/list', expenseHeadController.getAllExpenseHeads);
router.get('/view/:id', expenseHeadController.getExpenseHeadById);
router.put('/update/:id', expenseHeadController.updateExpenseHeadById);
router.delete('/delete/:id', expenseHeadController.deleteExpenseHeadById);

export default router;
