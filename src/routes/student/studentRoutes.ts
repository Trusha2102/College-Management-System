import express from 'express';
import {
  createStudent,
  getStudentById,
  updateStudentById,
  deleteStudentById,
  listStudents,
} from '../../controllers/student/studentController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', createStudent);

// Get a student by ID
router.get('/view/:id', getStudentById);

// Update a student by ID
router.put('/update/:id', updateStudentById);

// Delete a student by ID
router.delete('/delete/:id', deleteStudentById);

// List all students
router.get('/list', listStudents);

export default router;
