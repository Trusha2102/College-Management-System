import express from 'express';
import * as feesTypeController from '../../controllers/fees/feesTypeController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', feesTypeController.createFeesType);
router.put('/update/:id', feesTypeController.updateFeesType);
router.delete(
  '/delete/:id',

  feesTypeController.deleteFeesType,
);
router.get('/view/:id', feesTypeController.getFeesTypeById);
router.get('/list', feesTypeController.getAllFeesTypes);

export default router;
