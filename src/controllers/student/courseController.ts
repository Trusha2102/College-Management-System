import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Course } from '../../entity/Course';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import { ILike } from 'typeorm';

// Create a new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const trimmedCourseName = req.body.name.trim();

    if (!trimmedCourseName) {
      return sendError(res, 400, 'Course is required');
    }

    const existingCourse = await AppDataSource.manager.findOne(Course, {
      where: {
        name: ILike(trimmedCourseName),
      },
    });

    // If a similar course name already exists, send an error response
    if (existingCourse) {
      return sendError(res, 400, 'A course with a similar name already exists');
    }

    // Create a new course
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const courseRepository = queryRunner.manager.getRepository(Course);
      const newCourse = courseRepository.create({
        ...req.body,
        name: trimmedCourseName,
      });
      await courseRepository.save(newCourse);
      sendResponse(res, 201, 'Course created successfully', newCourse);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create course', error.message);
  }
};

// Get all courses
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courseRepository = AppDataSource.getRepository(Course);
    const courses = await courseRepository.find({
      order: { createdAt: 'DESC' },
    });
    sendResponse(res, 200, 'Courses fetched successfully', courses);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch courses', error.message);
  }
};

// Get a course by ID
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({
      where: { id: +id },
    });
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }
    sendResponse(res, 200, 'Course fetched successfully', course);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch course', error.message);
  }
};

// Update a course by ID
export const updateCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const courseRepository = queryRunner.manager.getRepository(Course);
      const course = await courseRepository.findOne({
        where: { id: +id },
      });
      if (!course) {
        sendError(res, 404, 'Course not found');
        return;
      }

      const trimmedCourseName = req.body.name.trim();

      const existingCourse = await courseRepository.findOne({
        where: {
          name: ILike(trimmedCourseName),
        },
      });

      if (existingCourse && existingCourse.id !== +id) {
        sendError(res, 400, 'A course with a similar name already exists');
        return;
      }

      courseRepository.merge(course, { ...req.body, name: trimmedCourseName });
      const updatedCourse = await courseRepository.save(course);
      sendResponse(res, 200, 'Course updated successfully', updatedCourse);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update course', error.message);
  }
};

// Delete a course by ID
export const deleteCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const courseRepository = queryRunner.manager.getRepository(Course);
      const course = await courseRepository.findOne({
        where: { id: +id },
      });
      if (!course) {
        sendError(res, 404, 'Course not found');
        return;
      }
      await courseRepository.remove(course);
      sendResponse(res, 204, 'Course deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete course', error.message);
  }
};
