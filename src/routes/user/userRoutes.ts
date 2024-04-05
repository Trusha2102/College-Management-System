import express from 'express';
import * as userController from '../../controllers/user/userController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, userController.createUser);
router.get('/list', permissionProtect, userController.getAllUsers);
router.get(
  '/in-active/list',
  permissionProtect,
  userController.getAllDeletedUsers,
);
router.get('/view/:id', permissionProtect, userController.getUserById);
router.put('/update/:id', permissionProtect, userController.updateUserById);
router.delete('/delete/:id', permissionProtect, userController.deleteUserById);

export default router;
