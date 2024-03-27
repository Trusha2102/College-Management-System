import express from 'express';
import {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployeeById,
} from '../../controllers/employee/employeeController';

const router = express.Router();

// Create a new student
router.post('/', createEmployee);

// Get a student by ID
router.get('/:id', getEmployeeById);

// Update a student by ID
router.put('/:id', updateEmployee);

// Delete a student by ID
router.delete('/:id', deleteEmployeeById);

// List all students
router.get('/', listEmployees);

export default router;
