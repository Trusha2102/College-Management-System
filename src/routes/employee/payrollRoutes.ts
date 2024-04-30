import express from 'express';
import * as payrollController from '../../controllers/employee/payrollController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, payrollController.createPayroll);
router.get('/view/:id', permissionProtect, payrollController.getPayrollById);
router.get('/list', permissionProtect, payrollController.getAllPayrolls);
router.put(
  '/update/:id',
  permissionProtect,
  payrollController.updatePayrollById,
);
router.delete(
  '/delete/:id',
  permissionProtect,
  payrollController.deletePayrollById,
);
router.get(
  '/staff-deduction/list',
  permissionProtect,
  payrollController.staffDeduction,
);
router.get(
  '/employee-payroll/list',
  permissionProtect,
  payrollController.getEmployeePayrollDetails,
);

export default router;
