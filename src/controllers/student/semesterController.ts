// src/controllers/semester/semesterController.ts
import { Request, Response } from 'express';
import { Semester } from '../../entity/Semester';
import { Course } from '../../entity/Course';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import { ILike, Like } from 'typeorm';
import { createActivityLog } from '../../utils/activityLog';

export const createSemester = async (req: Request, res: Response) => {
  try {
    const { semester, courseId } = req.body;
    const queryRunner = AppDataSource.createQueryRunner();

    const semesterRepository = queryRunner.manager.getRepository(Semester);

    const trimmedSemesterName = semester.trim();
    if (!trimmedSemesterName) {
      return sendError(res, 400, 'Semester is required');
    }

    const existingSemester = await semesterRepository.findOne({
      where: {
        semester: ILike(trimmedSemesterName),
        course: { id: courseId },
      },
    });

    if (existingSemester) {
      return sendError(
        res,
        400,
        'A semester with a similar name already exists for this course',
      );
    }

    await runTransaction(queryRunner, async () => {
      const courseRepository = queryRunner.manager.getRepository(Course);
      const course = await courseRepository.findOne({
        where: { id: +courseId },
      });
      if (!course) {
        sendError(res, 404, 'Course not found');
        return;
      }

      const semesterRepository = queryRunner.manager.getRepository(Semester);
      const newSemester = semesterRepository.create({
        semester,
        course,
      });
      await semesterRepository.save(newSemester);

      await createActivityLog(
        req.user?.id || 0,
        `Semester named ${newSemester.semester} for Course: ${newSemester.course.name} was created by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 201, 'Semester created successfully', newSemester);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create semester', error.message);
  }
};

export const getSemesterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const semesterRepository = AppDataSource.getRepository(Semester);
    const semester = await semesterRepository.findOne({
      where: { id: +id },
    });
    if (!semester) {
      return sendError(res, 404, 'Semester not found');
    }
    sendResponse(res, 200, 'Semester found', semester);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch semester', error.message);
  }
};

export const updateSemesterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { semester, courseId } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const courseRepository = queryRunner.manager.getRepository(Course);
      const course = await courseRepository.findOne({
        where: { id: +courseId },
      });
      if (!course) {
        sendError(res, 404, 'Course not found');
        return;
      }

      const trimmedSemesterName = semester.trim();
      if (!trimmedSemesterName) {
        sendError(res, 400, 'Semester is required');
        return;
      }

      const existingSemester = await AppDataSource.manager.findOne(Semester, {
        where: {
          semester: Like(trimmedSemesterName),
          course: courseId,
        },
      });
      if (existingSemester) {
        sendError(
          res,
          400,
          'A semester with a similar name already exists for this course',
        );
        return;
      }

      const semesterRepository = queryRunner.manager.getRepository(Semester);
      const semesterToUpdate = await semesterRepository.findOne({
        where: { id: +id },
      });
      if (!semesterToUpdate) {
        sendError(res, 404, 'Semester not found');
        return;
      }

      semesterToUpdate.semester = semester;
      semesterToUpdate.course = courseId;

      await semesterRepository.save(semesterToUpdate);

      await createActivityLog(
        req.user?.id || 0,
        `Semester named ${semesterToUpdate.semester} for Course: ${semesterToUpdate.course.name} was updated by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 200, 'Semester updated successfully', semesterToUpdate);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update semester', error.message);
  }
};

export const deleteSemesterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const semesterRepository = queryRunner.manager.getRepository(Semester);
      const semesterToDelete = await semesterRepository.findOne({
        where: { id: +id },
        relations: ['course'],
      });
      if (!semesterToDelete) {
        sendError(res, 404, 'Semester not found');
        return;
      }
      await semesterRepository.remove(semesterToDelete);

      await createActivityLog(
        req.user?.id || 0,
        `Semester named ${semesterToDelete.semester} for Course: ${semesterToDelete.course?.name} was deleted by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 200, 'Semester deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete semester', error.message);
  }
};

export const listSemesters = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { page, limit } = req.query;

    // Convert page and limit parameters to numbers
    const pageNumber = page ? parseInt(page as string) : 1;
    const limitNumber = limit ? parseInt(limit as string) : 10;

    // Calculate offset based on page number and limit
    const offset = (pageNumber - 1) * limitNumber;

    // Fetch semesters with pagination
    const [semesters, totalCount] = await AppDataSource.getRepository(
      Semester,
    ).findAndCount({
      where: { course: { id: +courseId } },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limitNumber,
    });

    const totalNoOfRecords = semesters.length;

    sendResponse(res, 200, 'Semesters found', {
      semesters,
      totalNoOfRecords,
      totalCount,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch semesters', error.message);
  }
};
