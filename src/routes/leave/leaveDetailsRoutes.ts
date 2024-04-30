import express from 'express';
import * as leaveDetailController from '../../controllers/leave/leaveDetailController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// router.post('/add', leaveDetailController.createLeaveDetail);
router.put(
  '/update/:id',
  permissionProtect,
  leaveDetailController.updateLeaveDetail,
);
router.delete(
  '/delete/:id',
  permissionProtect,
  leaveDetailController.deleteLeaveDetail,
);

export default router;
