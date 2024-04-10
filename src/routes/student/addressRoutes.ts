import express from 'express';
import * as addressController from '../../controllers/student/addressController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, addressController.createAddress);
router.get('/view/:id', permissionProtect, addressController.getAddressById);
router.put(
  '/update/:id',
  permissionProtect,
  addressController.updateAddressById,
);
router.delete(
  '/delete/:id',
  permissionProtect,
  addressController.deleteAddressById,
);

export default router;
