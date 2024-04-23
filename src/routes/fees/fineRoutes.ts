import express from 'express';
import * as fineController from '../../controllers/fees/fineController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, fineController.createFine);
router.put('/update/:id', permissionProtect, fineController.updateFineById);
router.delete('/delete/:id', permissionProtect, fineController.deleteFineById);
router.get('/view/:id', permissionProtect, fineController.getFineById);
router.get('/list', permissionProtect, fineController.getAllFines);

export default router;
