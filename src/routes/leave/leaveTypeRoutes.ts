import express from 'express';
import * as leaveTypeController from '../../controllers/leave/leaveTypeController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, leaveTypeController.createLeaveType);
router.get('/list', permissionProtect, leaveTypeController.getAllLeaveTypes);
router.put(
  '/update/:id',
  permissionProtect,
  leaveTypeController.updateLeaveType,
);
router.delete(
  '/delete/:id',
  permissionProtect,
  leaveTypeController.deleteLeaveType,
);

export default router;
