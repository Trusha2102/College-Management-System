import express from 'express';
import * as leaveTypeController from '../../controllers/leave/leaveTypeController';

const router = express.Router();

router.post('/add', leaveTypeController.createLeaveType);
router.get('/list', leaveTypeController.getAllLeaveTypes);
router.put('/update/:id', leaveTypeController.updateLeaveType);
router.delete('/delete/:id', leaveTypeController.deleteLeaveType);

export default router;
