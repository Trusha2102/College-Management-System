import express from 'express';
import * as permissionController from '../../controllers/permissions/permissionController';

const router = express.Router();

router.post('/add', permissionController.createPermission);
router.get('/list', permissionController.getAllPermissions);
// router.get('/:id', permissionController.getPermissionById);
router.put('/update', permissionController.updatePermissionById);
router.delete('/delete/:id', permissionController.deletePermissionById);
router.get('/html', permissionController.generatePermissionsHTML);

export default router;
