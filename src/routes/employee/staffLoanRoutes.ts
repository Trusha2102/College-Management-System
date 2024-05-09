import express from 'express';
import * as staffLoanController from '../../controllers/employee/staffLoanController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, staffLoanController.createStaffLoan);
router.put(
  '/update/:id',
  permissionProtect,
  staffLoanController.updateStaffLoanById,
);
router.delete(
  '/delete/:id',
  permissionProtect,
  staffLoanController.deleteStaffLoanById,
);
router.get(
  '/view/:id',
  permissionProtect,
  staffLoanController.getStaffLoanById,
);
router.get('/list', permissionProtect, staffLoanController.getAllStaffLoans);
router.get(
  '/my-staff-loan/list',
  permissionProtect,
  staffLoanController.getMyStaffLoans,
);

export default router;
