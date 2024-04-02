// ParentDetailsController.ts
import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import runTransaction from '../../utils/runTransaction';
import { ParentDetails } from '../../entity/ParentDetails';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Student } from '../../entity/Student';

export const createParentDetails = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.body;

    const studentRepository = AppDataSource.getRepository(Student);
    let existingStudent = await studentRepository.findOne({
      where: { id: student_id },
    });
    if (!existingStudent) {
      return sendError(res, 404, 'Student not found');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const parentDetailsRepository =
        queryRunner.manager.getRepository(ParentDetails);

      const newParentDetails = parentDetailsRepository.create(req.body);

      await parentDetailsRepository.save(newParentDetails);

      sendResponse(
        res,
        201,
        'Parent details created successfully',
        newParentDetails,
      );
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create parent details', error.message);
  }
};

export const updateParentDetailsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { student_id } = req.body;

    const studentRepository = AppDataSource.getRepository(Student);
    const existingStudent = await studentRepository.findOne({
      where: { id: student_id },
    });
    if (!existingStudent) {
      return sendError(res, 404, 'Student not found');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const parentDetailsRepository =
        queryRunner.manager.getRepository(ParentDetails);
      const parentDetails = await parentDetailsRepository.findOne({
        where: { id: +id },
      });
      if (!parentDetails) {
        sendError(res, 404, 'Parent details not found');
        return;
      }
      parentDetailsRepository.merge(parentDetails, req.body);

      await parentDetailsRepository.save(parentDetails);

      sendResponse(
        res,
        200,
        'Parent details updated successfully',
        parentDetails,
      );
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update parent details', error.message);
  }
};

export const deleteParentDetailsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const parentDetailsRepository =
        queryRunner.manager.getRepository(ParentDetails);
      const parentDetails = await parentDetailsRepository.findOne({
        where: { id: +id },
      });
      if (!parentDetails) {
        sendError(res, 404, 'Parent details not found');
        return;
      }
      await parentDetailsRepository.remove(parentDetails);
      sendResponse(res, 200, 'Parent details deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete parent details', error.message);
  }
};

export const getParentDetailsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const parentDetailsRepository = AppDataSource.getRepository(ParentDetails);
    const parentDetails = await parentDetailsRepository.findOne({
      where: { id: +id },
    });
    if (!parentDetails) {
      return sendError(res, 404, 'Parent details not found');
    }

    sendResponse(
      res,
      200,
      'Parent details retrieved successfully',
      parentDetails,
    );
  } catch (error: any) {
    sendError(res, 500, 'Failed to get parent details', error.message);
  }
};
