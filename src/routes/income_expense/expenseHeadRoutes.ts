import express from 'express';
import * as expenseHeadController from '../../controllers/income_expense/expenseHeadController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, expenseHeadController.createExpenseHead);
router.get(
  '/list',
  permissionProtect,
  expenseHeadController.getAllExpenseHeads,
);
router.get(
  '/view/:id',
  permissionProtect,
  expenseHeadController.getExpenseHeadById,
);
router.put(
  '/update/:id',
  permissionProtect,
  expenseHeadController.updateExpenseHeadById,
);
router.delete(
  '/delete/:id',
  permissionProtect,
  expenseHeadController.deleteExpenseHeadById,
);

export default router;
