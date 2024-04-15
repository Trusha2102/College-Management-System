import express from 'express';
import * as dashboardController from '../../controllers/dashboard/dashboardController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.get('/view', permissionProtect, dashboardController.getRecordsCount);

router.get(
  '/student-in-course/list',
  permissionProtect,
  dashboardController.getStudentCountByCourse,
);

router.get(
  '/teacher-in-department/list',
  permissionProtect,
  dashboardController.getEmployeeCountByDepartment,
);

router.get(
  '/staff-in-department/list',
  permissionProtect,
  dashboardController.countEmployeesInDepartment,
);

export default router;
