import express from 'express';
import * as parentsDetailsController from '../../controllers/student/parentsDetailsController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post(
  '/add',
  // permissionProtect,
  parentsDetailsController.createParentDetails,
);
router.get(
  '/view/:id',
  // permissionProtect,
  parentsDetailsController.getParentDetailsById,
);
router.put(
  '/update/:id',
  // permissionProtect,
  parentsDetailsController.updateParentDetailsById,
);
router.delete(
  '/delete/:id',
  // permissionProtect,
  parentsDetailsController.deleteParentDetailsById,
);

export default router;
