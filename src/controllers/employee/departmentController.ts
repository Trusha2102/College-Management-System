import { Request, Response } from 'express';
import { Department } from '../../entity/Department';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';

//Create Department
export const createDepartment = async (req: Request, res: Response) => {
  const { department } = req.body;
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await runTransaction(queryRunner, async () => {
      const departmentRepository =
        queryRunner.manager.getRepository(Department);
      const newDepartment = departmentRepository.create({ department });
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
    const departmentRepository = AppDataSource.getRepository(Department);
    const departments = await departmentRepository.find();
    sendResponse(res, 200, 'Departments found', departments);
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
      const department = await departmentRepository.findOne({
        where: { id: +id },
      });

      if (!department) {
        sendError(res, 404, 'Department not found');
        return; // Return to exit the function early
      }

      await departmentRepository.remove(department);

      sendResponse(res, 204, 'Department deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete department', error.message);
  }
};
