import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Student } from '../../entity/Student';
import { User } from '../../entity/User';
import { Role } from '../../entity/Role';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Course } from '../../entity/Course';
import { Employee } from '../../entity/Employee';
import { In, Not } from 'typeorm';

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
      where: { name: 'teacher' },
    });

    const staffRole = await roleRepository.findOne({
      where: {
        name: Not(In(['student', 'teacher'])),
      },
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

const getStudentCountByCourse = async (req: Request, res: Response) => {
  try {
    // Query all courses
    const courseRepository = AppDataSource.getRepository(Course);
    const courses = await courseRepository.find();

    // Object to store counts for each course
    const courseCounts: { [key: string]: number } = {};

    // Loop through each course and get the student count
    for (const course of courses) {
      const courseId = course.id;

      // Query the database to count students by course ID
      const studentRepository = AppDataSource.getRepository(Student);
      const studentCount = await studentRepository.count({
        where: { course_id: courseId },
      });

      // Store the count for the current course
      courseCounts[course.name] = studentCount;
    }

    sendResponse(res, 200, 'Student counts fetched successfully', {
      courseCounts,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to fetch student counts', error);
  }
};

const getEmployeeCountByDepartment = async (req: Request, res: Response) => {
  try {
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({ where: { name: 'teacher' } });

    if (!role) {
      return sendError(res, 404, 'Role not found');
    }

    const roleId = role.id;

    const employeeRepository = AppDataSource.getRepository(Employee);
    const employeeCountByDepartment = await employeeRepository
      .createQueryBuilder('employee')
      .leftJoin('employee.department', 'department')
      .leftJoin('employee.user', 'user')
      .where('user.role_id = :roleId', { roleId })
      .select(
        'department.department AS department, COUNT(employee.id) AS "teacherCount"',
      )
      .groupBy('department.department')
      .getRawMany();

    sendResponse(
      res,
      200,
      'Employee count fetched successfully',
      employeeCountByDepartment,
    );
  } catch (error) {
    sendError(res, 500, 'Failed to fetch employee count by department', error);
  }
};

const countEmployeesInDepartment = async (req: Request, res: Response) => {
  try {
    const employeeRepository = AppDataSource.getRepository(Employee);

    const counts = await employeeRepository
      .createQueryBuilder('employee')
      .innerJoin('employee.user', 'user')
      .innerJoin('user.role', 'role')
      .innerJoin('employee.department', 'department')
      .select('department.department', 'department')
      .addSelect('COUNT(employee.id)', 'staffCount')
      .where('role.name != :studentRoleName', { studentRoleName: 'student' })
      .andWhere('role.name != :teacherRoleName', { teacherRoleName: 'teacher' })
      .groupBy('department.department')
      .getRawMany();

    // Send the response with the counts
    sendResponse(res, 200, 'Employee counts retrieved successfully', {
      counts,
    });
  } catch (error: any) {
    // Handle errors
    console.error('Error fetching employee counts:', error);
    sendError(res, 500, 'Failed to fetch employee counts', error.message);
  }
};

export {
  getRecordsCount,
  getStudentCountByCourse,
  getEmployeeCountByDepartment,
  countEmployeesInDepartment,
};
