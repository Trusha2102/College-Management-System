import express from 'express';
import * as sendSmsController from '../../controllers/communication/sendSmsController';

const router = express.Router();

router.post('/add', sendSmsController.sendSMS);
// router.get('/list', permissionController.getAllPermissions);
// router.get('/list/:roleId', permissionController.getPermissionByRoleID);
// router.put('/update', permissionController.updatePermissionById);
// router.delete('/delete/:id', permissionController.deletePermissionById);
// router.get('/html', permissionController.generatePermissionsHTML);

export default router;
