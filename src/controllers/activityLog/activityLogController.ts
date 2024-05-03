import { Request, Response } from 'express';
import { ActivityLog } from '../../entity/ActivityLog';
import { sendError, sendResponse } from '../../utils/commonResponse';
import AppDataSource from '../../data-source';

export const listActivity = async (req: Request, res: Response) => {
  try {
    const activityLogRepository = AppDataSource.getRepository(ActivityLog);

    const { date, employeeId, page = 1, limit = 10 } = req.query;
    const dateString = date as string;

    let query = activityLogRepository
      .createQueryBuilder('activityLog')
      .leftJoinAndSelect('activityLog.user', 'user')
      .leftJoinAndSelect('user.employee', 'employee');

    if (dateString) {
      const startDate = new Date(dateString);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      query = query.andWhere(
        'activityLog.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }
    if (employeeId) {
      query = query.andWhere('employee.id = :employeeId', { employeeId });
    }

    const totalCount = await query.getCount();

    const offset = (+page - 1) * +limit;
    query = query.skip(offset).take(+limit);

    const activityLogs = await query.getMany();

    if (!activityLogs) {
      return sendError(res, 400, 'Error fetching Activity Logs');
    }

    const totalNoOfRecords = activityLogs.length;

    sendResponse(res, 200, 'Activity Logs Fetched Successfully', {
      activityLogs,
      totalCount,
      totalNoOfRecords,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch activity logs', error.message);
  }
};
