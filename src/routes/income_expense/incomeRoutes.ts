import express from 'express';
import * as incomeController from '../../controllers/income_expense/incomeController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, incomeController.createIncome);
router.get('/list', permissionProtect, incomeController.getAllIncomes);
router.get('/view/:id', permissionProtect, incomeController.getIncomeById);
router.put('/update/:id', permissionProtect, incomeController.updateIncomeById);
router.delete(
  '/delete/:id',
  permissionProtect,
  incomeController.deleteIncomeById,
);

export default router;
