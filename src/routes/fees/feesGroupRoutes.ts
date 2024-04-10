import express from 'express';
import * as feesGroupController from '../../controllers/fees/feesGroupController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, feesGroupController.createFeesGroup);
router.put(
  '/update/:id',
  permissionProtect,
  feesGroupController.updateFeesGroupById,
);
router.delete(
  '/delete/:id',
  permissionProtect,
  feesGroupController.deleteFeesGroupById,
);
router.get(
  '/view/:id',
  permissionProtect,
  feesGroupController.getFeesGroupById,
);
router.get('/list', permissionProtect, feesGroupController.getAllFeesGroups);

export default router;
