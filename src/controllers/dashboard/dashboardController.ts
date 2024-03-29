import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Student } from '../../entity/Student';
import { User } from '../../entity/User';
import { Role } from '../../entity/Role';
import { sendResponse, sendError } from '../../utils/commonResponse';

const getRecordsCount = async (req: Request, res: Response) => {
  try {
    const studentRepository = AppDataSource.getRepository(Student);
    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    // Get total number of active students
    const activeStudentsCount = await studentRepository.count({
      where: { is_active: true },
    });

    // Get role_id for Teacher and Staff roles
    const teacherRole = await roleRepository.findOne({
      where: { name: 'Teacher' },
    });
    const staffRole = await roleRepository.findOne({
      where: { name: 'Staff' },
    });

    if (!teacherRole || !staffRole) {
      return sendError(res, 500, 'Role not found');
    }

    // Get total number of users with role_id as Teacher
    const teacherUsersCount = await userRepository.count({
      where: { role_id: teacherRole.id },
    });

    // Get total number of users with role_id as Staff (excluding odd records)
    const staffUsersCount = await userRepository.count({
      where: { role_id: staffRole.id },
    });

    return sendResponse(res, 200, 'Records count fetched successfully', {
      activeStudentsCount,
      teacherUsersCount,
      staffUsersCount,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Failed to fetch records count');
  }
};

export { getRecordsCount };
