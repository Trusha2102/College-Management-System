import express from 'express';
import * as leaveDetailController from '../../controllers/leave/leaveDetailController';

const router = express.Router();

// router.post('/add', leaveDetailController.createLeaveDetail);
router.put('/update/:id', leaveDetailController.updateLeaveDetail);
router.delete('/delete/:id', leaveDetailController.deleteLeaveDetail);

export default router;
