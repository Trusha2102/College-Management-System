import express from 'express';
import {
  createDepartment,
  listDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartmentById,
} from '../../controllers/employee/departmentController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

// Create a new student
router.post('/add', createDepartment);

// Get a student by ID
router.get('/view/:id', getDepartmentById);

// Update a student by ID
router.put('/update/:id', updateDepartment);

// Delete a student by ID
router.delete('/delete/:id', deleteDepartmentById);

// List all students
router.get('/list', listDepartments);

export default router;
