import express from 'express';
import {
  createSemester,
  getSemesterById,
  updateSemesterById,
  deleteSemesterById,
  listSemesters,
} from '../../controllers/student/semesterController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', permissionProtect, createSemester);

// Get a student by ID
router.get('/list-by-id/view/:id', permissionProtect, getSemesterById);

// Update a student by ID
router.put('/update/:id', permissionProtect, updateSemesterById);

// Delete a student by ID
router.delete('/delete/:id', permissionProtect, deleteSemesterById);

// List all students
router.get('/list/:courseId', permissionProtect, listSemesters);

export default router;
