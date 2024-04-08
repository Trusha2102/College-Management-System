import express from 'express';
import * as resultController from '../../controllers/student/resultController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', resultController.createResult);
router.get(
  '/list/:studentId',

  resultController.listResultsByStudentId,
);
router.put('/update/:id', resultController.updateResultById);
router.delete(
  '/delete/:id',

  resultController.deleteResultById,
);

export default router;
