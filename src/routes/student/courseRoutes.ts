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
router.post('/add', createCourse);

// Get a student by ID
router.get('/view/:id', getCourseById);

// Update a student by ID
router.put('/update/:id', updateCourseById);

// Delete a student by ID
router.delete('/delete/:id', deleteCourseById);

// List all students
router.get('/list', getAllCourses);

export default router;
