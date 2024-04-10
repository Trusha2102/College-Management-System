import express from 'express';
import {
  createSection,
  listSections,
  getSectionById,
  updateSectionById,
  deleteSectionById,
} from '../../controllers/student/sectionController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', permissionProtect, createSection);

// Get a student by ID
router.get('/view/:id', permissionProtect, getSectionById);

// Update a student by ID
router.put('/update/:id', permissionProtect, updateSectionById);

// Delete a student by ID
router.delete('/delete/:id', permissionProtect, deleteSectionById);

// List all students
router.get('/list', permissionProtect, listSections);

export default router;
