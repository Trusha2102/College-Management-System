import express from 'express';
import * as activityLogController from '../../controllers/activityLog/activityLogController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.get('/list', permissionProtect, activityLogController.listActivity);

export default router;
