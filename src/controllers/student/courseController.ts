import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Course } from '../../entity/Course';
import { sendResponse, sendError } from '../../utils/commonResponse';

// Create a new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const courseRepository = AppDataSource.getRepository(Course);
    const newCourse = courseRepository.create(req.body);
    await courseRepository.save(newCourse);
    sendResponse(res, 201, 'Course created successfully', newCourse);
  } catch (error: any) {
    sendError(res, 500, 'Failed to create course', error.message);
  }
};

// Get all courses
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courseRepository = AppDataSource.getRepository(Course);
    const courses = await courseRepository.find();
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
      where: { id: parseInt(id, 10) },
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
    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }
    courseRepository.merge(course, req.body);
    const updatedCourse = await courseRepository.save(course);
    sendResponse(res, 200, 'Course updated successfully', updatedCourse);
  } catch (error: any) {
    sendError(res, 500, 'Failed to update course', error.message);
  }
};

// Delete a course by ID
export const deleteCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }
    await courseRepository.remove(course);
    sendResponse(res, 204, 'Course deleted successfully');
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete course', error.message);
  }
};
