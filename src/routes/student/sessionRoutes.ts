import express from 'express';
import {
  createSession,
  getAllSessions,
  getSessionById,
  updateSessionById,
  deleteSessionById,
} from '../../controllers/student/sessionController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', createSession);

// Get a student by ID
router.get('/view/:id', getSessionById);

// Update a student by ID
router.put('/update/:id', updateSessionById);

// Delete a student by ID
router.delete('/delete/:id', deleteSessionById);

// List all students
router.get('/list', getAllSessions);

export default router;
