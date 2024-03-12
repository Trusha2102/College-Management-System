const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/permissions/roleController');

// Create a new role
router.post('/', roleController.createRole);

// Get all roles
router.get('/', roleController.getAllRoles);

// Get a role by ID
router.get('/:id', roleController.getRoleById);

// Update a role by ID
router.put('/:id', roleController.updateRoleById);

// Delete a role by ID
router.delete('/:id', roleController.deleteRoleById);

export default router;
