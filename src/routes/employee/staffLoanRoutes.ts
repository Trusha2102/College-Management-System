import express from 'express';
import * as staffLoanController from '../../controllers/employee/staffLoanController';

const router = express.Router();

router.post('/add', staffLoanController.createStaffLoan);

export default router;
