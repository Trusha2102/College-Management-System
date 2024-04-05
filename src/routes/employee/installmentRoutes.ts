import express from 'express';
import * as installmentController from '../../controllers/employee/installmentController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// router.post('/add', installmentController.createInstallment);
router.put('/update/:id', installmentController.updateInstallment);
router.delete('/delete/:id', installmentController.deleteInstallment);
router.get(
  '/list/:staffLoanId',
  permissionProtect,
  installmentController.getInstallmentsByStaffLoanId,
);
router.get('/view/:id', installmentController.getInstallmentById);

export default router;
