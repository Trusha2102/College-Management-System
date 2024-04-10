import express from 'express';
import {
  createStudent,
  getStudentById,
  updateStudentById,
  deleteStudentById,
  listStudents,
} from '../../controllers/student/studentController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', permissionProtect, createStudent);

// Get a student by ID
router.get('/view/:id', permissionProtect, getStudentById);

// Update a student by ID
router.put('/update/:id', permissionProtect, updateStudentById);

// Delete a student by ID
router.delete('/delete/:id', permissionProtect, deleteStudentById);

// List all students
router.get('/list', permissionProtect, listStudents);

export default router;
