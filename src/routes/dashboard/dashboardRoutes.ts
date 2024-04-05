import express from 'express';
import * as dashboardController from '../../controllers/dashboard/dashboardController';

const router = express.Router();

router.get('/count/view', dashboardController.getRecordsCount);

export default router;
