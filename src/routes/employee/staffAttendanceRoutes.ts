import express from 'express';
import * as staffAttendanceController from '../../controllers/employee/staffAttendanceController';

const router = express.Router();

router.post('/add', staffAttendanceController.createAttendance);
router.get('/view/:id', staffAttendanceController.getAttendanceById);
router.get('/list', staffAttendanceController.getAllAttendances);
router.put('/update/:id', staffAttendanceController.updateAttendanceById);
router.delete('/delete/:id', staffAttendanceController.deleteAttendanceById);

export default router;
