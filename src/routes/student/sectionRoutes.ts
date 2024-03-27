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
router.post('/', createSection);

// Get a student by ID
router.get('/:id', getSectionById);

// Update a student by ID
router.put('/:id', updateSectionById);

// Delete a student by ID
router.delete('/:id', deleteSectionById);

// List all students
router.get('/', listSections);

export default router;
