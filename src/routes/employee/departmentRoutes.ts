import express from 'express';
import {
  createDepartment,
  listDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartmentById,
} from '../../controllers/employee/departmentController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', permissionProtect, createDepartment);

// Get a student by ID
router.get('/view/:id', permissionProtect, getDepartmentById);

// Update a student by ID
router.put('/update/:id', permissionProtect, updateDepartment);

// Delete a student by ID
router.delete('/delete/:id', permissionProtect, deleteDepartmentById);

// List all students
router.get('/list', permissionProtect, listDepartments);

export default router;
