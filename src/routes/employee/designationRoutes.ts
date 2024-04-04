import express from 'express';
import {
  createDesignation,
  listDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignationById,
} from '../../controllers/employee/designationController';

const router = express.Router();

// Create a new student
router.post('/add', createDesignation);

// Get a student by ID
router.get('/view/:id', getDesignationById);

// Update a student by ID
router.put('/update/:id', updateDesignation);

// Delete a student by ID
router.delete('/delete/:id', deleteDesignationById);

// List all students
router.get('/list', listDesignations);

export default router;
