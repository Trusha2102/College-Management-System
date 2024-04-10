import express from 'express';
import * as feesGroupController from '../../controllers/fees/feesGroupController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', feesGroupController.createFeesGroup);
router.put('/update/:id', feesGroupController.updateFeesGroupById);
router.delete('/delete/:id', feesGroupController.deleteFeesGroupById);
router.get('/view/:id', feesGroupController.getFeesGroupById);
router.get('/list', feesGroupController.getAllFeesGroups);

export default router;
