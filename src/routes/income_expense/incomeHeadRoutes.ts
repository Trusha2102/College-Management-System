import express from 'express';
import * as incomeHeadController from '../../controllers/income_expense/incomeHeadController';

const router = express.Router();

router.post('/add', incomeHeadController.createIncomeHead);
router.get('/list', incomeHeadController.getAllIncomeHeads);
router.get('/:id/view', incomeHeadController.getIncomeHeadById);
router.put('/:id/update', incomeHeadController.updateIncomeHeadById);
router.delete('/:id/delete', incomeHeadController.deleteIncomeHeadById);

export default router;
