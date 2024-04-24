import express from 'express';
import * as feesPaymentController from '../../controllers/fees/feesPaymentController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// router.post('/add', permissionProtect, feesTypeController.createFeesType);
// router.put('/update/:id', permissionProtect, feesTypeController.updateFeesType);
// router.delete(
//   '/delete/:id',
//   permissionProtect,
//   feesTypeController.deleteFeesType,
// );
router.get(
  '/view/:payment_id',
  permissionProtect,
  feesPaymentController.getFeesPaymentByPaymentId,
);

router.get(
  '/list',
  permissionProtect,
  feesPaymentController.getPaymentByStudentId,
);

export default router;
