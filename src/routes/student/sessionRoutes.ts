import express from 'express';
import {
  createSession,
  getAllSessions,
  getSessionById,
  updateSessionById,
  deleteSessionById,
} from '../../controllers/student/sessionController';

const router = express.Router();

// Create a new student
router.post('/', createSession);

// Get a student by ID
router.get('/:id', getSessionById);

// Update a student by ID
router.put('/:id', updateSessionById);

// Delete a student by ID
router.delete('/:id', deleteSessionById);

// List all students
router.get('/', getAllSessions);

export default router;
