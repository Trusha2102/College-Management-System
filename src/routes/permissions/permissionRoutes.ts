import express from 'express';
import * as permissionController from '../../controllers/permissions/permissionController';

const router = express.Router();

router.post('/', permissionController.createPermission);
router.get('/', permissionController.getAllPermissions);
// router.get('/:id', permissionController.getPermissionById);
router.put('/:id', permissionController.updatePermissionById);
router.delete('/:id', permissionController.deletePermissionById);

export default router;
