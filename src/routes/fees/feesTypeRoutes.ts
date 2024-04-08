import express from 'express';
import * as feesTypeController from '../../controllers/fees/feesTypeController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, feesTypeController.createFeesType);
router.put('/update/:id', permissionProtect, feesTypeController.updateFeesType);
router.delete(
  '/delete/:id',
  permissionProtect,
  feesTypeController.deleteFeesType,
);
router.get('/view/:id', permissionProtect, feesTypeController.getFeesTypeById);
router.get('/list', permissionProtect, feesTypeController.getAllFeesTypes);

export default router;
