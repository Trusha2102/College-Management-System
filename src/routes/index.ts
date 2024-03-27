import express from 'express';
import roleRoutes from './permissions/roleRoutes';
import moduleRoutes from './modules/moduleRoutes';
import permissionRoutes from './permissions/permissionRoutes';
import userRoutes from './user/userRoutes';
import loginRoutes from './auth/loginRoutes';
import studentRoutes from './student/studentRoutes';
import sessionRoutes from './student/sessionRoutes';
import courseRoutes from './student/courseRoutes';
import semesterRoutes from './student/semesterRoutes';
import classRoutes from './student/classRoutes';
import sectionRoutes from './student/sectionRoutes';
import employeeRoutes from './employee/employeeRoutes';
import departmentRoutes from './employee/departmentRoutes';
import designationRoutes from './employee/designationRoutes';

const router = express.Router();

router.use('/roles', roleRoutes);
router.use('/module', moduleRoutes);
router.use('/permission', permissionRoutes);
router.use('/user', userRoutes);
router.use('/login', loginRoutes);
router.use('/student', studentRoutes);
router.use('/session', sessionRoutes);
router.use('/course', courseRoutes);
router.use('/semester', semesterRoutes);
router.use('/class', classRoutes);
router.use('/section', sectionRoutes);
router.use('/employee', employeeRoutes);
router.use('/department', departmentRoutes);
router.use('/designation', designationRoutes);

export default router;
