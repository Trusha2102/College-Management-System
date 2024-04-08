import express from 'express';
import * as payrollController from '../../controllers/employee/payrollController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', payrollController.createPayroll);
router.get('/view/:id', payrollController.getPayrollById);
router.get('/list', payrollController.getAllPayrolls);
router.put(
  '/update/:id',
  // permissionProtect,
  payrollController.updatePayrollById,
);
router.delete(
  '/delete/:id',
  // permissionProtect,
  payrollController.deletePayrollById,
);

export default router;
