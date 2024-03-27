// src/controllers/semester/semesterController.ts
import { Request, Response } from 'express';
import { Semester } from '../../entity/Semester';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';

export const createSemester = async (req: Request, res: Response) => {
  try {
    const { semester, courseId } = req.body;
    const courseRepository = AppDataSource.getRepository(Semester);
    const course = await courseRepository.findOne(courseId);
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    const semesterRepository = AppDataSource.getRepository(Semester);
    const newSemester = semesterRepository.create({
      semester,
      course,
    });
    await semesterRepository.save(newSemester);
    sendResponse(res, 201, 'Semester created successfully', newSemester);
  } catch (error: any) {
    sendError(res, 500, 'Failed to create semester', error.message);
  }
};

export const getSemesterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const semesterRepository = AppDataSource.getRepository(Semester);
    const semester = await semesterRepository.findOne({
      where: { id: parseInt(id, 10) },
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

    const courseRepository = AppDataSource.getRepository(Semester);
    const course = await courseRepository.findOne(courseId);
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    const semesterRepository = AppDataSource.getRepository(Semester);
    const semesterToUpdate = await semesterRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!semesterToUpdate) {
      return sendError(res, 404, 'Semester not found');
    }

    semesterToUpdate.semester = semester;
    semesterToUpdate.course = courseId;

    await semesterRepository.save(semesterToUpdate);
    sendResponse(res, 200, 'Semester updated successfully', semesterToUpdate);
  } catch (error: any) {
    sendError(res, 500, 'Failed to update semester', error.message);
  }
};

export const deleteSemesterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const semesterRepository = AppDataSource.getRepository(Semester);
    const semesterToDelete = await semesterRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!semesterToDelete) {
      return sendError(res, 404, 'Semester not found');
    }
    await semesterRepository.remove(semesterToDelete);
    sendResponse(res, 204, 'Semester deleted successfully');
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete semester', error.message);
  }
};

export const listSemesters = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const semesterRepository = AppDataSource.getRepository(Semester);
    const semesters = await semesterRepository.find({
      where: { course: { id: parseInt(courseId, 10) } },
    });
    sendResponse(res, 200, 'Semesters found', semesters);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch semesters', error.message);
  }
};
