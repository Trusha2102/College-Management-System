import express from 'express';
import {
  createDepartment,
  listDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartmentById,
} from '../../controllers/employee/departmentController';

const router = express.Router();

// Create a new student
router.post('/', createDepartment);

// Get a student by ID
router.get('/:id', getDepartmentById);

// Update a student by ID
router.put('/:id', updateDepartment);

// Delete a student by ID
router.delete('/:id', deleteDepartmentById);

// List all students
router.get('/', listDepartments);

export default router;
