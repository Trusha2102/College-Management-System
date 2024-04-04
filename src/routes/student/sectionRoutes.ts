import express from 'express';
import {
  createSection,
  listSections,
  getSectionById,
  updateSectionById,
  deleteSectionById,
} from '../../controllers/student/sectionController';

const router = express.Router();

// Create a new student
router.post('/add', createSection);

// Get a student by ID
router.get('/view/:id', getSectionById);

// Update a student by ID
router.put('/update/:id', updateSectionById);

// Delete a student by ID
router.delete('/delete/:id', deleteSectionById);

// List all students
router.get('/list', listSections);

export default router;
