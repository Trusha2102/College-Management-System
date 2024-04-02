import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Result } from '../../entity/Result';
import { Student } from '../../entity/Student';
import { Course } from '../../entity/Course';
import { Semester } from '../../entity/Semester';

// Create a new result
export const createResult = async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, semesterId, result } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const studentRepository = queryRunner.manager.getRepository(Student);
      const courseRepository = queryRunner.manager.getRepository(Course);
      const semesterRepository = queryRunner.manager.getRepository(Semester);
      const resultRepository = queryRunner.manager.getRepository(Result);

      const student = await studentRepository.findOne({
        where: { id: +studentId },
      });
      if (!student) {
        sendError(res, 404, 'Student not found');
        return;
      }

      const course = await courseRepository.findOne({
        where: { id: +courseId },
      });
      if (!course) {
        sendError(res, 404, 'Course not found');
        return;
      }

      const semester = await semesterRepository.findOne({
        where: { id: +semesterId },
      });
      if (!semester) {
        sendError(res, 404, 'Semester not found');
        return;
      }

      const newResult = resultRepository.create({
        student,
        course,
        semester,
        result,
      });
      await resultRepository.save(newResult);
      sendResponse(res, 201, 'Result created successfully', newResult);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create result', error.message);
  }
};

// Update result by ID
export const updateResultById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId, courseId, semesterId, result } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const studentRepository = queryRunner.manager.getRepository(Student);
      const courseRepository = queryRunner.manager.getRepository(Course);
      const semesterRepository = queryRunner.manager.getRepository(Semester);
      const resultRepository = queryRunner.manager.getRepository(Result);

      const resultToUpdate = await resultRepository.findOne({
        where: { id: +id },
      });
      if (!resultToUpdate) {
        sendError(res, 404, 'Result not found');
        return;
      }

      const student = await studentRepository.findOne({
        where: { id: +studentId },
      });
      if (!student) {
        sendError(res, 404, 'Student not found');
        return;
      }

      const course = await courseRepository.findOne({
        where: { id: +courseId },
      });
      if (!course) {
        sendError(res, 404, 'Course not found');
        return;
      }

      const semester = await semesterRepository.findOne({
        where: { id: +semesterId },
      });
      if (!semester) {
        sendError(res, 404, 'Semester not found');
        return;
      }

      resultToUpdate.student = student;
      resultToUpdate.course = course;
      resultToUpdate.semester = semester;
      resultToUpdate.result = result;

      await resultRepository.save(resultToUpdate);

      sendResponse(res, 200, 'Result updated successfully', resultToUpdate);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update result', error.message);
  }
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
    const resultRepository = AppDataSource.getRepository(Result);
    const results = await resultRepository.find({
      where: { student: { id: +studentId } },
      relations: ['student', 'course', 'semester'],
    });
    sendResponse(res, 200, 'Results found', results);
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
