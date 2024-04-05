const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/permissions/roleController');
// import casbinEnforcerMiddleware from '../../middlewares/authMiddleware';
// import { authorizationMiddleware } from '../../middlewares/authMiddleware';
// import verifyToken from '../../utils/verifyToken'; // Assuming this is the path to your verifyToken middleware

// Create a new role
router.post('/add', roleController.createRole);

// Get all roles
router.get('/get-roles/list', roleController.getAllRoles);

// Get a role by ID
router.get('/view/:id', roleController.getRoleById);

// Update a role by ID
router.put('/update/:id', roleController.updateRoleById);

// Delete a role by ID
router.delete('/delete/:id', roleController.deleteRoleById);

export default router;
