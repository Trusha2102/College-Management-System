import { Request, Response } from 'express';
import { Section } from '../../entity/Section';
import { Class } from '../../entity/Class';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';

export const createSection = async (req: Request, res: Response) => {
  try {
    const { classId, section } = req.body;
    const classRepository = AppDataSource.getRepository(Class);
    const parsedClassId = typeof classId === 'object' ? classId.id : classId;
    const cls = await classRepository.findOne({
      where: { id: parseInt(parsedClassId, 10) },
    });
    if (!cls) {
      return sendError(res, 404, 'Course not found');
    }

    const sectionRepository = AppDataSource.getRepository(Section);
    const newSection = sectionRepository.create({
      class: cls,
      section,
    });
    await sectionRepository.save(newSection);
    sendResponse(res, 201, 'Section created successfully', newSection);
  } catch (error: any) {
    sendError(res, 500, 'Failed to create section', error.message);
  }
};

export const listSections = async (req: Request, res: Response) => {
  try {
    const sectionRepository = AppDataSource.getRepository(Section);
    const sections = await sectionRepository.find();
    sendResponse(res, 200, 'Sections found', sections);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch sections', error.message);
  }
};

export const getSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sectionRepository = AppDataSource.getRepository(Section);
    const section = await sectionRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!section) {
      return sendError(res, 404, 'Section not found');
    }
    sendResponse(res, 200, 'Section found', section);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch section', error.message);
  }
};

export const updateSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { classId, section } = req.body;
    const sectionRepository = AppDataSource.getRepository(Section);
    const classRepository = AppDataSource.getRepository(Class);
    const parsedClassId = typeof classId === 'object' ? classId.id : classId;
    const cls = await classRepository.findOne({
      where: { id: parseInt(parsedClassId, 10) },
    });
    if (!cls) {
      return sendError(res, 404, 'Course not found');
    }

    const updatedSection = await sectionRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!updatedSection) {
      return sendError(res, 404, 'Section not found');
    }

    updatedSection.class = cls;
    updatedSection.section = section;
    await sectionRepository.save(updatedSection);
    sendResponse(res, 200, 'Section updated successfully', updatedSection);
  } catch (error: any) {
    sendError(res, 500, 'Failed to update section', error.message);
  }
};

export const deleteSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sectionRepository = AppDataSource.getRepository(Section);
    const section = await sectionRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!section) {
      return sendError(res, 404, 'Section not found');
    }

    await sectionRepository.remove(section);
    sendResponse(res, 204, 'Section deleted successfully');
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete section', error.message);
  }
};
