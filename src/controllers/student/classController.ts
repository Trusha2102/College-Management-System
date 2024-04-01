import { Request, Response } from 'express';
import { Class } from '../../entity/Class';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';

// Create a new class
export const createClass = async (req: Request, res: Response) => {
  try {
    const { class_name, is_active } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const classRepository = queryRunner.manager.getRepository(Class);
      const newClass = classRepository.create({
        class_name,
        is_active,
      });
      await classRepository.save(newClass);
      sendResponse(res, 201, 'Class created successfully', newClass);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create class', error.message);
  }
};
// Get all classes
export const listClasses = async (req: Request, res: Response) => {
  try {
    const classRepository = AppDataSource.getRepository(Class);
    const classes = await classRepository.find();
    sendResponse(res, 200, 'Classes found', classes);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch classes', error.message);
  }
};

// Get class by ID
export const getClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classRepository = AppDataSource.getRepository(Class);
    const classItem = await classRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!classItem) {
      return sendError(res, 404, 'Class not found');
    }
    sendResponse(res, 200, 'Class found', classItem);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch class', error.message);
  }
};

// Update class by ID
export const updateClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { class_name, is_active } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const classRepository = queryRunner.manager.getRepository(Class);
      const classItem = await classRepository.findOne({
        where: { id: parseInt(id, 10) },
      });
      if (!classItem) {
        sendError(res, 404, 'Class not found');
        return;
      }
      classItem.class_name = class_name;
      classItem.is_active = is_active;
      await classRepository.save(classItem);
      sendResponse(res, 200, 'Class updated successfully', classItem);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update class', error.message);
  }
};

// Delete class by ID
export const deleteClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const classRepository = queryRunner.manager.getRepository(Class);
      const classItem = await classRepository.findOne({
        where: { id: parseInt(id, 10) },
      });
      if (!classItem) {
        sendError(res, 404, 'Class not found');
        return;
      }

      classItem.is_active = false;

      await classRepository.save(classItem);
      sendResponse(res, 204, 'Class deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete class', error.message);
  }
};
