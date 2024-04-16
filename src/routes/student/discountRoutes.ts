import express from 'express';
import * as discountController from '../../controllers/student/discountController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, discountController.createDiscount);
router.get('/list', permissionProtect, discountController.getAllDiscounts);
router.get('/view/:id', permissionProtect, discountController.getDiscountById);
router.put('/update/:id', permissionProtect, discountController.updateDiscount);
router.delete(
  '/delete/:id',
  permissionProtect,
  discountController.deleteDiscount,
);

export default router;
