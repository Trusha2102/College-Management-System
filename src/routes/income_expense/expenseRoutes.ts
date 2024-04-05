import express from 'express';
import * as expenseController from '../../controllers/income_expense/expenseController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', expenseController.createExpense);
router.get('/list', permissionProtect, expenseController.getAllExpenses);
router.get('/view/:id', permissionProtect, expenseController.getExpenseById);
router.put('/update/:id', expenseController.updateExpenseById);
router.delete('/delete/:id', expenseController.deleteExpenseById);

export default router;
