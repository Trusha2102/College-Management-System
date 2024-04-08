import express from 'express';
import {
  createSession,
  getAllSessions,
  getSessionById,
  updateSessionById,
  deleteSessionById,
} from '../../controllers/student/sessionController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', permissionProtect, createSession);

// Get a student by ID
router.get('/view/:id', permissionProtect, getSessionById);

// Update a student by ID
router.put('/update/:id', permissionProtect, updateSessionById);

// Delete a student by ID
router.delete('/delete/:id', permissionProtect, deleteSessionById);

// List all students
router.get('/list', permissionProtect, getAllSessions);

export default router;
