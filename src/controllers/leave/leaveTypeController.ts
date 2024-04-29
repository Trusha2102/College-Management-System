import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { LeaveType } from '../../entity/LeaveType';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';

// Create a LeaveType
export const createLeaveType = async (req: Request, res: Response) => {
  try {
    await runTransaction(AppDataSource.createQueryRunner(), async () => {
      const leaveTypeRepository = AppDataSource.getRepository(LeaveType);
      const newLeaveType = leaveTypeRepository.create(req.body);
      const createdLeaveType = await leaveTypeRepository.save(newLeaveType);
      sendResponse(
        res,
        201,
        'Leave type created successfully',
        createdLeaveType,
      );
    });
  } catch (error) {
    sendError(res, 500, 'Failed to create leave type', error);
  }
};

// Update a LeaveType
export const updateLeaveType = async (req: Request, res: Response) => {
  try {
    await runTransaction(AppDataSource.createQueryRunner(), async () => {
      const { id } = req.params;
      const leaveTypeRepository = AppDataSource.getRepository(LeaveType);
      const existingLeaveType = await leaveTypeRepository.findOne({
        where: { id: +id },
      });
      if (!existingLeaveType) {
        sendError(res, 404, 'Leave type not found');
        return;
      }
      leaveTypeRepository.merge(existingLeaveType, req.body);
      const updatedLeaveType =
        await leaveTypeRepository.save(existingLeaveType);
      sendResponse(
        res,
        200,
        'Leave type updated successfully',
        updatedLeaveType,
      );
    });
  } catch (error) {
    sendError(res, 500, 'Failed to update leave type', error);
  }
};

// Delete a LeaveType
export const deleteLeaveType = async (req: Request, res: Response) => {
  try {
    await runTransaction(AppDataSource.createQueryRunner(), async () => {
      const { id } = req.params;
      const leaveTypeRepository = AppDataSource.getRepository(LeaveType);
      const deleteResult = await leaveTypeRepository.delete(id);
      if (deleteResult.affected === 0) {
        sendError(res, 404, 'Leave type not found');
        return;
      }
      sendResponse(res, 200, 'Leave type deleted successfully');
    });
  } catch (error) {
    sendError(res, 500, 'Failed to delete leave type', error);
  }
};

// Get all LeaveTypes
export const getAllLeaveTypes = async (req: Request, res: Response) => {
  try {
    const leaveTypeRepository = AppDataSource.getRepository(LeaveType);
    let query = leaveTypeRepository.createQueryBuilder('leaveType');

    // Pagination
    const { page, limit } = req.query;
    let totalCount: number;
    let totalNoOfRecords: number;
    let leaveTypes: any;

    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      totalCount = await query.getCount();

      query = query.skip(skip).take(limitNumber);
      leaveTypes = await query.getMany();
      totalNoOfRecords = leaveTypes.length;
    } else {
      leaveTypes = await query.getMany();
      totalCount = leaveTypes.length;
      totalNoOfRecords = leaveTypes.length;
    }

    sendResponse(res, 200, 'Leave types fetched successfully', {
      leaveTypes,
      totalCount,
      totalNoOfRecords,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to fetch leave types', error);
  }
};
