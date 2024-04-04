import express from 'express';
import * as payrollController from '../../controllers/employee/payrollController';

const router = express.Router();

router.post('/add', payrollController.createPayroll);
router.get('/view/:id', payrollController.getPayrollById);
router.get('/list', payrollController.getAllPayrolls);
router.put('/update/:id', payrollController.updatePayrollById);
router.delete('/delete/:id', payrollController.deletePayrollById);

export default router;
