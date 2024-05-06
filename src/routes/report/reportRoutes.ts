import express from 'express';
import * as incomeReport from '../../controllers/report/incomeReport';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.get('/list', incomeReport.listAndGeneratePDF);

export default router;
