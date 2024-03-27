import express from 'express';
import {
  createStudent,
  getStudentById,
  updateStudentById,
  deleteStudentById,
  listStudents,
} from '../../controllers/student/studentController';

const router = express.Router();

// Create a new student
router.post('/', createStudent);

// Get a student by ID
router.get('/:id', getStudentById);

// Update a student by ID
router.put('/:id', updateStudentById);

// Delete a student by ID
router.delete('/:id', deleteStudentById);

// List all students
router.get('/', listStudents);

export default router;
