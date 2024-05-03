import { Request, Response } from 'express';
import { Section } from '../../entity/Section';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import { ILike } from 'typeorm';
import { Semester } from '../../entity/Semester';
import { createActivityLog } from '../../utils/activityLog';

export const createSection = async (req: Request, res: Response) => {
  try {
    const { section, semester_id } = req.body;
    const queryRunner = AppDataSource.createQueryRunner();

    const semesterRepository = queryRunner.manager.getRepository(Semester);

    // Await the semester retrieval
    const semester = await semesterRepository.findOne({
      where: { id: semester_id },
    });

    if (!semester) {
      sendError(res, 400, 'Semester Not Found');
      return;
    }

    const trimmedSectionName = section.trim();

    await runTransaction(queryRunner, async () => {
      const sectionRepository = queryRunner.manager.getRepository(Section);

      const existingSection = await sectionRepository.findOne({
        where: {
          section: ILike(trimmedSectionName),
          semester: semester,
        },
      });

      if (existingSection) {
        sendError(res, 400, 'A section with a similar name already exists');
        return;
      }

      const newSection = sectionRepository.create({
        section: trimmedSectionName,
        semester: semester,
      });

      await createActivityLog(
        req.user?.id || 0,
        `Section named ${trimmedSectionName}  for Semester: ${section.semester?.semester} was created by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      await sectionRepository.save(newSection);
      sendResponse(res, 201, 'Section created successfully', newSection);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create section', error.message);
  }
};

export const listSections = async (req: Request, res: Response) => {
  try {
    const { page, limit, section } = req.query;

    // Convert page and limit parameters to numbers
    const pageNumber = page ? parseInt(page as string) : 1;
    const limitNumber = limit ? parseInt(limit as string) : 10;

    // Calculate offset based on page number and limit
    const offset = (pageNumber - 1) * limitNumber;

    // Initialize filter object
    const filter: any = {};

    // Add section filter if provided
    if (section) {
      filter.section = ILike(`%${section}%`);
    }

    // Fetch sections with pagination and filter
    const [sections, totalCount] = await AppDataSource.getRepository(
      Section,
    ).findAndCount({
      where: filter,
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limitNumber,
      relations: ['semester'],
    });

    const totalNoOfRecords = sections.length;

    sendResponse(res, 200, 'Sections found', {
      sections,
      totalNoOfRecords,
      totalCount,
    });
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
    const { section, semester_id } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();

    const semesterRepository = queryRunner.manager.getRepository(Semester);

    // Await the semester retrieval
    const semester = await semesterRepository.findOne({
      where: { id: semester_id },
    });

    if (!semester) {
      sendError(res, 400, 'Semester Not Found');
      return;
    }

    await runTransaction(queryRunner, async () => {
      const sectionRepository = queryRunner.manager.getRepository(Section);

      const updatedSection = await sectionRepository.findOne({
        where: { id: +id },
        relations: ['semester'],
      });
      if (!updatedSection) {
        sendError(res, 404, 'Section not found');
        return;
      }

      const trimmedSectionName = section.trim();

      const existingSection = await sectionRepository.findOne({
        where: {
          section: ILike(trimmedSectionName),
          semester: semester,
        },
      });

      if (existingSection && existingSection.id !== updatedSection.id) {
        sendError(
          res,
          400,
          'A section with a similar name already exists in this semester',
        );
        return;
      }

      updatedSection.section = section;
      updatedSection.semester = semester;
      await sectionRepository.save(updatedSection);

      await createActivityLog(
        req.user?.id || 0,
        `Section named ${updatedSection.section} for Semester: ${updatedSection.semester.semester} was updated by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

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
        relations: ['semester'],
      });
      if (!section) {
        sendError(res, 404, 'Section not found');
        return;
      }

      await createActivityLog(
        req.user?.id || 0,
        `Section named ${section.section} for Semester: ${section.semester.semester} was deleted by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      await sectionRepository.remove(section);
      sendResponse(res, 200, 'Section deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete section', error.message);
  }
};
