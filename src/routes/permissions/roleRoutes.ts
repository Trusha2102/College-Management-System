const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/permissions/roleController');
// import casbinEnforcerMiddleware from '../../middlewares/authMiddleware';
import { authorizationMiddleware } from '../../middlewares/authMiddleware';
import verifyToken from '../../utils/verifyToken'; // Assuming this is the path to your verifyToken middleware

// Create a new role
router.post('/', verifyToken, authorizationMiddleware, roleController.createRole);

// Get all roles
router.get('/get-roles', verifyToken, authorizationMiddleware, roleController.getAllRoles);

// Get a role by ID
router.get('/:id', roleController.getRoleById);

// Update a role by ID
router.put('/:id', verifyToken, authorizationMiddleware, roleController.updateRoleById);

// Delete a role by ID
router.delete('/:id', verifyToken, authorizationMiddleware, roleController.deleteRoleById);

export default router;
