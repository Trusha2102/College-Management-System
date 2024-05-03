import { Request, Response } from 'express';
import { ActivityLog } from '../../entity/ActivityLog';
import { sendError, sendResponse } from '../../utils/commonResponse';
import AppDataSource from '../../data-source';

export const listActivity = async (req: Request, res: Response) => {
  try {
    const activityLogRepository = AppDataSource.getRepository(ActivityLog);

    const activityLog = await activityLogRepository.find({
      relations: ['user'],
    });

    if (!activityLog) {
      return sendError(res, 400, 'Error fetching Activity Log');
    }

    sendResponse(res, 200, 'Activity Logs Fetched Successfully', activityLog);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch activity logs', error.message);
  }
};
