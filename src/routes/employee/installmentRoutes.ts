import express from 'express';
import * as installmentController from '../../controllers/employee/installmentController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// router.post('/add', staffLoanController.createStaffLoan);
// router.put('/update/:id', staffLoanController.updateStaffLoanById);
// router.delete('/delete/:id', staffLoanController.deleteStaffLoanById);
router.get(
  '/list/:staffLoanId',
  permissionProtect,
  installmentController.getInstallmentsByStaffLoanId,
);
// router.get('/list', staffLoanController.getAllStaffLoans);

export default router;
