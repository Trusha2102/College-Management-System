const express = require('express');
const router = express.Router();
const moduleController = require('../../controllers/modules/moduleController');

// Create a new role
router.post('/add', moduleController.createModule);

// Get all roles
router.get('/list', moduleController.getAllModules);

// Get a role by ID
router.get('/view/:id', moduleController.getModuleById);

// Update a role by ID
router.put('/update/:id', moduleController.updateModuleById);

// Delete a role by ID
router.delete('/delete/:id', moduleController.deleteModuleById);

export default router;
