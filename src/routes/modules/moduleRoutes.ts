const express = require('express');
const router = express.Router();
const moduleController = require('../../controllers/modules/moduleController');

// Create a new role
router.post('/', moduleController.createModule);

// Get all roles
router.get('/', moduleController.getAllModules);

// Get a role by ID
router.get('/:id', moduleController.getModuleById);

// Update a role by ID
router.put('/:id', moduleController.updateModuleById);

// Delete a role by ID
router.delete('/:id', moduleController.deleteModuleById);

export default router;
