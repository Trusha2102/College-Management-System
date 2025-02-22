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

router.post(
  '/collect-fees/add',
  permissionProtect,
  feesMasterController.collectFees,
);

router.get(
  '/fee-dues/list',
  permissionProtect,
  feesMasterController.searchFeeDues,
);

// router.get('/list', permissionProtect, feesGroupController.getAllFeesGroups);

router.get(
  '/generate-invoice/view/:student_id',
  feesMasterController.generateInvoice,
);

export default router;
