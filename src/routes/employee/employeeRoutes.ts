import express from 'express';
import {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployeeById,
} from '../../controllers/employee/employeeController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', createEmployee);

// Get a student by ID
router.get('/view/:id', getEmployeeById);

// Update a student by ID
router.put('/update/:id', updateEmployee);

// Delete a student by ID
router.delete('/delete/:id', deleteEmployeeById);

// List all students
router.get('/list', listEmployees);

export default router;
