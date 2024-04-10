import express from 'express';
import * as staffAttendanceController from '../../controllers/employee/staffAttendanceController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post(
  '/add',
  permissionProtect,
  staffAttendanceController.createAttendance,
);
router.get(
  '/view/:id',
  permissionProtect,
  staffAttendanceController.getAttendanceById,
);
router.get(
  '/list',
  permissionProtect,
  staffAttendanceController.getAllAttendances,
);
router.put(
  '/update/:id',
  permissionProtect,
  staffAttendanceController.updateAttendanceById,
);
router.delete(
  '/delete/:id',
  permissionProtect,
  staffAttendanceController.deleteAttendanceById,
);

export default router;
