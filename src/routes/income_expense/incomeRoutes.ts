import express from 'express';
import * as incomeController from '../../controllers/income_expense/incomeController';

const router = express.Router();

router.post('/add', incomeController.createIncome);
router.get('/list', incomeController.getAllIncomes);
router.get('/view/:id', incomeController.getIncomeById);
router.put('/update/:id', incomeController.updateIncomeById);
router.delete('/delete/:id', incomeController.deleteIncomeById);

export default router;
