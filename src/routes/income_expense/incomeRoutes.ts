import express from 'express';
import * as incomeController from '../../controllers/income_expense/incomeController';

const router = express.Router();

router.post('/add', incomeController.createIncome);
router.get('/list', incomeController.getAllIncomes);
router.get('/:id/view', incomeController.getIncomeById);
router.put('/:id/update', incomeController.updateIncomeById);
router.delete('/:id/delete', incomeController.deleteIncomeById);

export default router;
