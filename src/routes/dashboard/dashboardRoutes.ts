import express from 'express';
import * as dashboardController from '../../controllers/dashboard/dashboardController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.get('/view', permissionProtect, dashboardController.getRecordsCount);

export default router;
