import express from 'express';
import * as resultController from '../../controllers/student/resultController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, resultController.createResult);
router.get(
  '/list/:studentId',
  permissionProtect,
  resultController.listResultsByStudentId,
);
router.put('/update/:id', permissionProtect, resultController.updateResultById);
router.delete(
  '/delete/:id',
  permissionProtect,
  resultController.deleteResultById,
);

export default router;
