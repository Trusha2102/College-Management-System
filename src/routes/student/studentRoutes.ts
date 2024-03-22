import express from 'express';
import {
  createStudent,
  getStudentById,
  updateStudentById,
  deleteStudentById
} from '../../controllers/student/studentController';

const router = express.Router();

router.post('/', createStudent);
router.get('/:id', getStudentById);
router.put('/:id', updateStudentById);
router.delete('/:id', deleteStudentById);

export default router;
