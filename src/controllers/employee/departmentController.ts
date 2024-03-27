import { Request, Response } from 'express';
import { Department } from '../../entity/Department';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';

//Create Department
export const createDepartment = async (req: Request, res: Response) => {
  const { department } = req.body;
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const departmentRepository = queryRunner.manager.getRepository(Department);
    const newDepartment = departmentRepository.create({ department });
    await departmentRepository.save(newDepartment);

    await queryRunner.commitTransaction();

    sendResponse(res, 201, 'Department created successfully', newDepartment);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    sendError(res, 500, 'Failed to create department', error.message);
  } finally {
    await queryRunner.release();
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
      where: { id: parseInt(id, 10) },
    });
    if (!department) {
      return sendError(res, 404, 'Department not found');
    }
    sendResponse(res, 200, 'Department found', department);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch department', error.message);
  }
};

// Update Department with Transaction
export const updateDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { department } = req.body;
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const departmentRepository = queryRunner.manager.getRepository(Department);
    const existingDepartment = await departmentRepository.findOne({
      where: { id: parseInt(id, 10) },
    });

    if (!existingDepartment) {
      return sendError(res, 404, 'Department not found');
    }

    departmentRepository.merge(existingDepartment, { department });
    await departmentRepository.save(existingDepartment);

    await queryRunner.commitTransaction();

    sendResponse(
      res,
      200,
      'Department updated successfully',
      existingDepartment,
    );
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    sendError(res, 500, 'Failed to update department', error.message);
  } finally {
    await queryRunner.release();
  }
};

// Delete Department by ID with Transaction
export const deleteDepartmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const departmentRepository = queryRunner.manager.getRepository(Department);
    const department = await departmentRepository.findOne({
      where: { id: parseInt(id, 10) },
    });

    if (!department) {
      return sendError(res, 404, 'Department not found');
    }

    await departmentRepository.remove(department);

    await queryRunner.commitTransaction();

    sendResponse(res, 204, 'Department deleted successfully');
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    sendError(res, 500, 'Failed to delete department', error.message);
  } finally {
    await queryRunner.release();
  }
};
