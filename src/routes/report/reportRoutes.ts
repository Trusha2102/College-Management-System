import express from 'express';
import * as incomeReport from '../../controllers/report/incomeReport';
import * as expenseReport from '../../controllers/report/expenseReport';
import * as payrollReport from '../../controllers/report/payrollReport';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.get('/income-report/list', incomeReport.incomeReport);
router.get('/expense-report/list', expenseReport.expenseReport);
router.get('/payroll-report/list', payrollReport.payrollReport);

export default router;
