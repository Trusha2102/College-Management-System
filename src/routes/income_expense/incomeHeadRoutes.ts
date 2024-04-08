import express from 'express';
import * as incomeHeadController from '../../controllers/income_expense/incomeHeadController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', incomeHeadController.createIncomeHead);
router.get('/list', incomeHeadController.getAllIncomeHeads);
router.get(
  '/view/:id',
  // permissionProtect,
  incomeHeadController.getIncomeHeadById,
);
router.put(
  '/update/:id',
  // permissionProtect,
  incomeHeadController.updateIncomeHeadById,
);
router.delete(
  '/delete/:id',
  // permissionProtect,
  incomeHeadController.deleteIncomeHeadById,
);

export default router;
