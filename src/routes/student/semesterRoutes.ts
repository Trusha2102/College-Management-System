import express from 'express';
import {
  createSemester,
  getSemesterById,
  updateSemesterById,
  deleteSemesterById,
  listSemesters,
} from '../../controllers/student/semesterController';

const router = express.Router();

// Create a new student
router.post('/', createSemester);

// Get a student by ID
router.get('/list-by-id/:id', getSemesterById);

// Update a student by ID
router.put('/:id', updateSemesterById);

// Delete a student by ID
router.delete('/:id', deleteSemesterById);

// List all students
router.get('/:courseId', listSemesters);

export default router;
