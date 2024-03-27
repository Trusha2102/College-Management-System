import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourseById,
  deleteCourseById,
} from '../../controllers/student/courseController';

const router = express.Router();

// Create a new student
router.post('/', createCourse);

// Get a student by ID
router.get('/:id', getCourseById);

// Update a student by ID
router.put('/:id', updateCourseById);

// Delete a student by ID
router.delete('/:id', deleteCourseById);

// List all students
router.get('/', getAllCourses);

export default router;
