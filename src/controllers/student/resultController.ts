import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Result } from '../../entity/Result';
import { Student } from '../../entity/Student';
import { Course } from '../../entity/Course';
import { Semester } from '../../entity/Semester';
import { StudentHistory } from '../../entity/StudentHistory';
import { Session } from '../../entity/Session';

// Create a new result
export const createResult = async (req: Request, res: Response) => {
  try {
    const { results, Promote } = req.body;
    const { courseId } = Promote; // Extract courseId from Promote

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const studentRepository = queryRunner.manager.getRepository(Student);
      const courseRepository = queryRunner.manager.getRepository(Course);
      const semesterRepository = queryRunner.manager.getRepository(Semester);
      const resultRepository = queryRunner.manager.getRepository(Result);
      const studentHistoryRepository =
        queryRunner.manager.getRepository(StudentHistory);
      const sessionRepository = queryRunner.manager.getRepository(Session);

      const validateExistence = async (
        entity: any,
        id: string,
        name: string,
      ) => {
        const record = await entity.findOne({ where: { id: +id } });
        if (!record) {
          sendError(res, 400, `${name} not found: ${id}`);
          return false;
        }
        return true;
      };

      // Validate Promote fields
      const validatePromote = await Promise.all([
        validateExistence(
          sessionRepository,
          Promote.current_session_id,
          'Current Session',
        ),
        validateExistence(
          sessionRepository,
          Promote.promote_session_id,
          'Promote Session',
        ),
        validateExistence(
          semesterRepository,
          Promote.current_semester_id,
          'Current Semester',
        ),
        validateExistence(
          semesterRepository,
          Promote.promote_semester_id,
          'Promote Semester',
        ),
      ]);

      if (validatePromote.includes(false)) return;

      for (const resultData of results) {
        const { studentId, result, next_course_status } = resultData;

        const validateResult = await Promise.all([
          validateExistence(studentRepository, studentId, 'Student'),
          // Use courseId from Promote
          validateExistence(courseRepository, courseId, 'Course'),
        ]);

        if (validateResult.includes(false)) return;

        const newResult = resultRepository.create({
          student: { id: +studentId },
          course: { id: +courseId }, // Use courseId from Promote
          result,
          current_session_id: Promote.current_session_id,
          promote_session_id: Promote.promote_session_id,
          current_semester_id: Promote.current_semester_id,
          promote_semester_id: Promote.promote_semester_id,
          current_section_id: Promote.current_section_id,
          promote_section_id: Promote.promote_section_id,
        });
        await resultRepository.save(newResult);

        // Update Student History
        await studentHistoryRepository
          .createQueryBuilder()
          .update(StudentHistory)
          .set({
            result: newResult,
            next_course_status,
            session: Promote.promote_session_id,
            semester: Promote.promote_semester_id,
          })
          .where('studentId = :studentId', { studentId })
          .andWhere('courseId = :courseId', { courseId })
          .execute();
      }

      sendResponse(res, 201, 'Results created successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create results', error.message);
  }
};

// Update result by ID
export const updateResultById = async (req: Request, res: Response) => {
  // try {
  //   const { id } = req.params;
  //   const { studentId, courseId, semesterId, result, next_course_status } =
  //     req.body;
  //   const queryRunner = AppDataSource.createQueryRunner();
  //   await runTransaction(queryRunner, async () => {
  //     const studentRepository = queryRunner.manager.getRepository(Student);
  //     const courseRepository = queryRunner.manager.getRepository(Course);
  //     const semesterRepository = queryRunner.manager.getRepository(Semester);
  //     const resultRepository = queryRunner.manager.getRepository(Result);
  //     const studentHistoryRepository =
  //       queryRunner.manager.getRepository(StudentHistory);
  //     const resultToUpdate = await resultRepository.findOne({
  //       where: { id: +id },
  //     });
  //     if (!resultToUpdate) {
  //       sendError(res, 404, 'Result not found');
  //       return;
  //     }
  //     const student = await studentRepository.findOne({
  //       where: { id: +studentId },
  //     });
  //     if (!student) {
  //       sendError(res, 404, 'Student not found');
  //       return;
  //     }
  //     const course = await courseRepository.findOne({
  //       where: { id: +courseId },
  //     });
  //     if (!course) {
  //       sendError(res, 404, 'Course not found');
  //       return;
  //     }
  //     const semester = await semesterRepository.findOne({
  //       where: { id: +semesterId },
  //     });
  //     if (!semester) {
  //       sendError(res, 404, 'Semester not found');
  //       return;
  //     }
  //     resultToUpdate.student = student;
  //     resultToUpdate.course = course;
  //     resultToUpdate.semester = semester;
  //     resultToUpdate.result = result;
  //     await resultRepository.save(resultToUpdate);
  //     await studentHistoryRepository
  //       .createQueryBuilder()
  //       .update(StudentHistory)
  //       .set({
  //         next_course_status: next_course_status,
  //       })
  //       .where('studentId = :studentId', { studentId: studentId })
  //       .andWhere('courseId = :courseId', { courseId: courseId })
  //       .andWhere('semesterId = :semesterId', { semesterId: semesterId })
  //       .execute();
  //     sendResponse(res, 200, 'Result updated successfully', resultToUpdate);
  //   });
  // } catch (error: any) {
  //   sendError(res, 500, 'Failed to update result', error.message);
  // }
};

// Delete result by ID
export const deleteResultById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const resultRepository = queryRunner.manager.getRepository(Result);
      const result = await resultRepository.findOne({
        where: { id: +id },
      });
      if (!result) {
        sendError(res, 404, 'Result not found');
        return;
      }
      await resultRepository.delete(id);
      sendResponse(res, 200, 'Result deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete result', error.message);
  }
};

// List results by student_id
export const listResultsByStudentId = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { page, limit } = req.query;

    // Convert page and limit parameters to numbers
    const pageNumber = page ? parseInt(page as string) : 1;
    const limitNumber = limit ? parseInt(limit as string) : 10;

    // Calculate offset based on page number and limit
    const offset = (pageNumber - 1) * limitNumber;

    // Fetch results with pagination
    const [results, totalCount] = await AppDataSource.getRepository(
      Result,
    ).findAndCount({
      where: { student: { id: +studentId } },
      relations: ['student', 'course', 'semester'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limitNumber,
    });

    const totalNoOfRecords = results.length;

    sendResponse(res, 200, 'Results found', {
      results,
      totalNoOfRecords,
      totalCount,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to get results', error.message);
  }
};

// Get result by ID
// export const getResultById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const resultRepository = AppDataSource.getRepository(Result);
//     const result = await resultRepository.findOne({
//       where: { id: +id },
//     });
//     if (!result) {
//       return sendError(res, 404, 'Result not found');
//     }
//     sendResponse(res, 200, 'Result found', result);
//   } catch (error: any) {
//     sendError(res, 500, 'Failed to get result', error.message);
//   }
// };
