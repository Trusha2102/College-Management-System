import express from 'express';
import {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployeeById,
  createEmployeeWithUser,
  updateEmployeeWithUser,
} from '../../controllers/employee/employeeController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', permissionProtect, createEmployee);

// Get a student by ID
router.get('/view/:id', permissionProtect, getEmployeeById);

// Update a student by ID
router.put('/update/:id', permissionProtect, updateEmployee);

// Delete a student by ID
router.delete('/delete/:id', permissionProtect, deleteEmployeeById);

// List all students
router.get('/list', permissionProtect, listEmployees);

//Create User and Employee
router.post('/create/add', createEmployeeWithUser);

//Update User with Employee Record
router.put('/create/update/:id', updateEmployeeWithUser);

export default router;
