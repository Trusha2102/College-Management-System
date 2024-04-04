import { Request, Response } from 'express';
import { Section } from '../../entity/Section';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';

export const createSection = async (req: Request, res: Response) => {
  try {
    const { section } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const sectionRepository = queryRunner.manager.getRepository(Section);
      const newSection = sectionRepository.create({
        section,
      });
      await sectionRepository.save(newSection);
      sendResponse(res, 201, 'Section created successfully', newSection);
    });
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
      where: { id: +id },
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
    const { section } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const sectionRepository = queryRunner.manager.getRepository(Section);

      const updatedSection = await sectionRepository.findOne({
        where: { id: +id },
      });
      if (!updatedSection) {
        sendError(res, 404, 'Section not found');
        return;
      }

      updatedSection.section = section;
      await sectionRepository.save(updatedSection);
      sendResponse(res, 200, 'Section updated successfully', updatedSection);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update section', error.message);
  }
};

export const deleteSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const sectionRepository = queryRunner.manager.getRepository(Section);
      const section = await sectionRepository.findOne({
        where: { id: +id },
      });
      if (!section) {
        sendError(res, 404, 'Section not found');
        return;
      }

      await sectionRepository.remove(section);
      sendResponse(res, 204, 'Section deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete section', error.message);
  }
};
