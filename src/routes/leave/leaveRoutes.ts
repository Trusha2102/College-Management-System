import express from 'express';
import * as leaveController from '../../controllers/leave/leaveController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, leaveController.applyLeave);
router.put('/update/:id', permissionProtect, leaveController.updateLeave);
router.delete('/delete/:id', permissionProtect, leaveController.deleteLeave);
router.get('/list', permissionProtect, leaveController.listLeaves);
router.get(
  '/list/:employeeId',
  permissionProtect,
  leaveController.listLeaveByEmployeeId,
);

export default router;
