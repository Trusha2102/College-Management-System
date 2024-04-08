import express from 'express';
import * as userController from '../../controllers/user/userController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', userController.createUser);
router.get('/list', userController.getAllUsers);
router.get(
  '/in-active/list',

  userController.getAllDeletedUsers,
);
router.get('/view/:id', userController.getUserById);
router.put('/update/:id', userController.updateUserById);
router.delete('/delete/:id', userController.deleteUserById);

export default router;
