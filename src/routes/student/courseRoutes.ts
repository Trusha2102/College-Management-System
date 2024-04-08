import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourseById,
  deleteCourseById,
} from '../../controllers/student/courseController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', permissionProtect, createCourse);

// Get a student by ID
router.get('/view/:id', permissionProtect, getCourseById);

// Update a student by ID
router.put('/update/:id', permissionProtect, updateCourseById);

// Delete a student by ID
router.delete('/delete/:id', permissionProtect, deleteCourseById);

// List all students
router.get('/list', permissionProtect, getAllCourses);

export default router;
