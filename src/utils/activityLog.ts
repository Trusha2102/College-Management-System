import AppDataSource from '../data-source';
import { ActivityLog } from '../entity/ActivityLog';
import { User } from '../entity/User';

async function createActivityLog(
  userId: number,
  action: string,
): Promise<ActivityLog> {
  const activityLogRepository = AppDataSource.getRepository(ActivityLog);
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error('There was some error finding user for activity log entry');
  }

  const date = new Date().toLocaleDateString('en-GB');

  const activityLog = new ActivityLog();
  //@ts-ignore
  activityLog.user = user;
  activityLog.user_id = userId;
  activityLog.action = action;
  activityLog.date = new Date(date);

  return await activityLogRepository.save(activityLog);
}

export { createActivityLog };
