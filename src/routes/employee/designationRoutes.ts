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
router.post('/', createDesignation);

// Get a student by ID
router.get('/:id', getDesignationById);

// Update a student by ID
router.put('/:id', updateDesignation);

// Delete a student by ID
router.delete('/:id', deleteDesignationById);

// List all students
router.get('/', listDesignations);

export default router;
