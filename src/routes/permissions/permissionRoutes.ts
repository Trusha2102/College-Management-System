import express from 'express';
import * as permissionController from '../../controllers/permissions/permissionController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionController.createPermission);
router.get('/list', permissionController.getAllPermissions);
router.get(
  '/list/:roleId',
  //   permissionProtect,
  permissionController.getPermissionByRoleID,
);
router.put(
  '/update',
  //   permissionProtect,
  permissionController.updatePermissionById,
);
router.delete(
  '/delete/:id',
  //   permissionProtect,
  permissionController.deletePermissionById,
);
router.get('/html', permissionController.generatePermissionsHTML);

export default router;
