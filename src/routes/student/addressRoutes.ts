import express from 'express';
import * as addressController from '../../controllers/student/addressController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', addressController.createAddress);
router.get('/view/:id', addressController.getAddressById);
router.put(
  '/update/:id',

  addressController.updateAddressById,
);
router.delete(
  '/delete/:id',

  addressController.deleteAddressById,
);

export default router;
