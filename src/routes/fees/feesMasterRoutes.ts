import express from 'express';
import * as feesMasterController from '../../controllers/fees/feesMasterController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, feesMasterController.feesAllocation);

// router.put(
//   '/update/:id',
//   permissionProtect,
//   feesGroupController.updateFeesGroupById,
// );
// router.delete(
//   '/delete/:id',
//   permissionProtect,
//   feesGroupController.deleteFeesGroupById,
// );
router.get(
  '/list/:student_id',
  permissionProtect,
  feesMasterController.getFeesMasterByStudentId,
);
// router.get('/list', permissionProtect, feesGroupController.getAllFeesGroups);

export default router;
