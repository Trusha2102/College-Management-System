import express from 'express';
import * as incomeHeadController from '../../controllers/income_expense/incomeHeadController';

const router = express.Router();

router.post('/add', incomeHeadController.createIncomeHead);
router.get('/list', incomeHeadController.getAllIncomeHeads);
router.get('/view/:id', incomeHeadController.getIncomeHeadById);
router.put('/update/:id', incomeHeadController.updateIncomeHeadById);
router.delete('/delete/:id', incomeHeadController.deleteIncomeHeadById);

export default router;
