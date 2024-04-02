// src/controllers/semester/semesterController.ts
import { Request, Response } from 'express';
import { Semester } from '../../entity/Semester';
import { Course } from '../../entity/Course';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';

export const createSemester = async (req: Request, res: Response) => {
  try {
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

      const semesterRepository = queryRunner.manager.getRepository(Semester);
      const newSemester = semesterRepository.create({
        semester,
        course,
      });
      await semesterRepository.save(newSemester);
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
      });
      if (!semesterToDelete) {
        sendError(res, 404, 'Semester not found');
        return;
      }
      await semesterRepository.remove(semesterToDelete);
      sendResponse(res, 204, 'Semester deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete semester', error.message);
  }
};

export const listSemesters = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const semesterRepository = AppDataSource.getRepository(Semester);
    const semesters = await semesterRepository.find({
      where: { course: { id: +courseId } },
    });
    sendResponse(res, 200, 'Semesters found', semesters);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch semesters', error.message);
  }
};
