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
import sectionRoutes from './student/sectionRoutes';
import employeeRoutes from './employee/employeeRoutes';
import departmentRoutes from './employee/departmentRoutes';
import designationRoutes from './employee/designationRoutes';
import noticeRoutes from './notice/noticeRoutes';
import dashboardRoutes from './dashboard/dashboardRoutes';
import incomeHeadRoutes from './income_expense/incomeHeadRoutes';
import incomeRoutes from './income_expense/incomeRoutes';
import expenseHeadRoutes from './income_expense/expenseHeadRoutes';
import expenseRoutes from './income_expense/expenseRoutes';
import addressRoutes from './student/addressRoutes';
import parentDetailsRoutes from './student/parentsDetailsRoutes';
import resultRoutes from './student/resultRoutes';
import payrollRoutes from './employee/payrollRoutes';

const router = express.Router();

router.use('/roles', roleRoutes);
router.use('/module', moduleRoutes);
router.use('/permission', permissionRoutes);
router.use('/user', userRoutes);
router.use('/auth', loginRoutes);
router.use('/student', studentRoutes);
router.use('/session', sessionRoutes);
router.use('/course', courseRoutes);
router.use('/semester', semesterRoutes);
router.use('/section', sectionRoutes);
router.use('/employee', employeeRoutes);
router.use('/department', departmentRoutes);
router.use('/designation', designationRoutes);
router.use('/notice', noticeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/income-head', incomeHeadRoutes);
router.use('/income', incomeRoutes);
router.use('/expense-head', expenseHeadRoutes);
router.use('/expense', expenseRoutes);
router.use('/address', addressRoutes);
router.use('/parents-details', parentDetailsRoutes);
router.use('/result', resultRoutes);
router.use('/payroll', payrollRoutes);

export default router;
