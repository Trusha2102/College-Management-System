import { Request, Response } from 'express';
import { Department } from '../../entity/Department';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import { ILike } from 'typeorm';
import { Employee } from '../../entity/Employee';

//Create Department
export const createDepartment = async (req: Request, res: Response) => {
  const { department } = req.body;

  // Check if department field is empty
  if (!department) {
    return sendError(res, 400, 'Department name cannot be empty');
  }

  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await runTransaction(queryRunner, async () => {
      const departmentRepository =
        queryRunner.manager.getRepository(Department);

      // Check if department name already exists (case-insensitive)
      const existingDepartment = await departmentRepository.findOne({
        where: { department: ILike(department) },
      });

      if (existingDepartment) {
        sendError(res, 400, 'Department name already exists');
        return;
      }

      // Create new department entity
      const newDepartment = departmentRepository.create({ department });

      // Save the new department
      await departmentRepository.save(newDepartment);

      sendResponse(res, 201, 'Department created successfully', newDepartment);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create department', error.message);
  }
};

// Get All Departments
export const listDepartments = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = req.query;
    const departmentRepository = AppDataSource.getRepository(Department);
    let query = departmentRepository.createQueryBuilder('department');
    let departments = [];

    // Apply search filter if search query parameter is provided
    if (search) {
      query = query.where('LOWER(department.department) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    // Fetch total count
    const totalCount = await query.getCount();

    // If page and limit are provided, apply pagination
    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      // Fetch paginated data
      departments = await query
        .orderBy('department.createdAt', 'DESC')
        .skip(skip)
        .take(limitNumber)
        .getMany();
    } else {
      // If page and limit are not provided, fetch all departments
      departments = await query
        .orderBy('department.createdAt', 'DESC')
        .getMany();
    }

    sendResponse(res, 200, 'Departments found', {
      departments,
      totalNoOfRecords: departments.length,
      totalCount,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch departments', error.message);
  }
};

// Get Department by ID
export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const departmentRepository = AppDataSource.getRepository(Department);
    const department = await departmentRepository.findOne({
      where: { id: +id },
    });
    if (!department) {
      return sendError(res, 404, 'Department not found');
    }
    sendResponse(res, 200, 'Department found', department);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch department', error.message);
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { department } = req.body;
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await runTransaction(queryRunner, async () => {
      const departmentRepository =
        queryRunner.manager.getRepository(Department);
      const existingDepartment = await departmentRepository.findOne({
        where: { id: +id },
      });

      if (!existingDepartment) {
        sendError(res, 404, 'Department not found');
        return; // Ensure to return here to exit the function early
      }

      departmentRepository.merge(existingDepartment, { department });
      await departmentRepository.save(existingDepartment);

      sendResponse(
        res,
        200,
        'Department updated successfully',
        existingDepartment,
      );
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update department', error.message);
  }
};

export const deleteDepartmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await runTransaction(queryRunner, async () => {
      const departmentRepository =
        queryRunner.manager.getRepository(Department);
      const employeeRepository = queryRunner.manager.getRepository(Employee);

      // Check if any employee record references the department
      const departmentHasEmployees = await employeeRepository.findOne({
        where: { department: { id: +id } },
      });

      if (departmentHasEmployees) {
        sendError(
          res,
          400,
          'Cannot delete department as it has associated employees',
        );
        return;
      }

      const department = await departmentRepository.findOne({
        where: { id: +id },
      });

      if (!department) {
        sendError(res, 404, 'Department not found');
        return; // Return to exit the function early
      }

      await departmentRepository.remove(department);

      sendResponse(res, 200, 'Department deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete department', error.message);
  }
};
