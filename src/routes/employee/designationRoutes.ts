import express from 'express';
import {
  createDesignation,
  listDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignationById,
} from '../../controllers/employee/designationController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', permissionProtect, createDesignation);

// Get a student by ID
router.get('/view/:id', permissionProtect, getDesignationById);

// Update a student by ID
router.put('/update/:id', permissionProtect, updateDesignation);

// Delete a student by ID
router.delete('/delete/:id', permissionProtect, deleteDesignationById);

// List all students
router.get('/list', permissionProtect, listDesignations);

export default router;
