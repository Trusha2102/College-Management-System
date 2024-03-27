import express from 'express';
import {
  createClass,
  listClasses,
  getClassById,
  updateClassById,
  deleteClassById,
} from '../../controllers/student/classController';

const router = express.Router();

// Create a new student
router.post('/', createClass);

// Get a student by ID
router.get('/:id', getClassById);

// Update a student by ID
router.put('/:id', updateClassById);

// Delete a student by ID
router.delete('/:id', deleteClassById);

// List all students
router.get('/', listClasses);

export default router;
