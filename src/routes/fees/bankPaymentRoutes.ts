import express from 'express';
import * as bankPaymentController from '../../controllers/fees/bankPaymentController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.put(
  '/update/:id',
  permissionProtect,
  bankPaymentController.updateBankPayment,
);

router.delete(
  '/delete/:id',
  permissionProtect,
  bankPaymentController.deleteBankPayment,
);

router.get(
  '/view/:id',
  permissionProtect,
  bankPaymentController.viewBankPaymentById,
);

router.get(
  '/list',
  permissionProtect,
  bankPaymentController.getAllBankPayments,
);

export default router;
