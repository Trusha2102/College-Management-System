import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Notice } from '../../entity/Notice';
import { sendResponse, sendError } from '../../utils/commonResponse';
import configureMulter from '../../utils/multerConfig';
import multer from 'multer';
import runTransaction from '../../utils/runTransaction';

const upload = configureMulter('./uploads/Notice', 2 * 1024 * 1024); //2MB Limit

// Get all notices
const getAllNotices = async (req: Request, res: Response) => {
  try {
    const noticeRepository = AppDataSource.getRepository(Notice);
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page as string, 10);
    limit = parseInt(limit as string, 10);

    const [notices, totalCount] = await noticeRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const totalNoOfRecords = notices.length;

    const totalPages = Math.ceil(totalCount / limit);

    return sendResponse(res, 200, 'Notices fetched successfully', {
      notices,
      page,
      limit,
      totalNoOfRecords,
      totalCount,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Failed to fetch notices');
  }
};

// Get notice by ID
const getNoticeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const noticeRepository = AppDataSource.getRepository(Notice);
    const notice = await noticeRepository.findOne({
      where: { id: +id },
    });
    if (!notice) {
      return sendError(res, 404, 'Notice not found');
    }
    return sendResponse(res, 200, 'Notice fetched successfully', notice);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Failed to fetch notice');
  }
};

// Create Notice
const createNotice = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    upload.single('attachment')(req, res, async (err: any) => {
      if (err instanceof multer.MulterError) {
        return sendError(res, 400, 'File upload error: ' + err.message);
      } else if (err) {
        return sendError(res, 500, 'Failed to upload attachment');
      }

      await runTransaction(queryRunner, async () => {
        const { messageTo } = req.body;
        const attachment = req.file ? req.file.path : undefined;

        const noticeRepository = queryRunner.manager.getRepository(Notice);
        const newNotice = noticeRepository.create({
          ...req.body,
          messageTo: messageTo ? messageTo.split(',') : [],
          attachment,
        });
        await noticeRepository.save(newNotice);
        sendResponse(res, 201, 'Notice created successfully', newNotice);
      });
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to create notice');
  }
};

// Update notice by ID
const updateNoticeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();
    upload.single('attachment')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        if (err instanceof multer.MulterError) {
          return sendError(res, 400, 'File upload error: ' + err.message);
        } else {
          return sendError(res, 500, 'Failed to upload attachment');
        }
      }

      await runTransaction(queryRunner, async () => {
        const { title, noticeDate, publishOn, messageTo, message } = req.body;
        const attachment = req.file ? req.file.path : null;

        const noticeRepository = queryRunner.manager.getRepository(Notice);
        const notice = await noticeRepository.findOne({
          where: { id: +id },
        });
        if (!notice) {
          sendError(res, 404, 'Notice not found');
          return;
        }
        // Update only the fields that are present in req.body
        Object.assign(notice, {
          // title,
          // noticeDate,
          // publishOn,
          // messageTo,
          // message,
          // attachment,
          ...req.body,
        });

        await noticeRepository.save(notice);
        sendResponse(res, 200, 'Notice updated successfully', notice);
      });
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to update notice');
  }
};

// Delete notice by ID
const deleteNoticeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const noticeRepository = queryRunner.manager.getRepository(Notice);
      const notice = await noticeRepository.findOne({
        where: { id: +id },
      });
      if (!notice) {
        sendError(res, 404, 'Notice not found');
        return;
      }
      await noticeRepository.remove(notice);
      sendResponse(res, 200, 'Notice deleted successfully');
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to delete notice');
  }
};

export {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNoticeById,
  deleteNoticeById,
};
