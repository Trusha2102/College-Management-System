import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Notice } from '../../entity/Notice';
import { sendResponse, sendError } from '../../utils/commonResponse';
import configureMulter from '../../utils/multerConfig';
import multer from 'multer';
import { LessThanOrEqual } from 'typeorm';

const upload = configureMulter('./uploads/Notice', 2 * 1024 * 1024); //2MB Limit

// Get all notices
const getAllNotices = async (req: Request, res: Response) => {
  try {
    const noticeRepository = AppDataSource.getRepository(Notice);
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page as string, 10);
    limit = parseInt(limit as string, 10);

    const [notices, totalCount] = await noticeRepository.findAndCount({
      where: {
        publishOn: LessThanOrEqual(new Date()),
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return sendResponse(res, 200, 'Notices fetched successfully', {
      notices,
      page,
      limit,
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
      where: { id: parseInt(id, 10) },
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

//Create Notice
const createNotice = async (req: Request, res: Response) => {
  upload.single('attachment')(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return sendError(res, 400, 'File upload error: ' + err.message);
    } else if (err) {
      return sendError(res, 500, 'Failed to upload attachment');
    }

    const { title, noticeDate, publishOn, messageTo, message } = req.body;
    const attachment = req.file ? req.file.path : undefined;

    try {
      const noticeRepository = AppDataSource.getRepository(Notice);
      const newNotice = noticeRepository.create({
        title,
        noticeDate,
        publishOn,
        messageTo: messageTo ? messageTo.split(',') : [],
        message,
        attachment,
      });
      await noticeRepository.save(newNotice);
      return sendResponse(res, 201, 'Notice created successfully', newNotice);
    } catch (error) {
      console.error(error);
      return sendError(res, 500, 'Failed to create notice');
    }
  });
};

// Update notice by ID
const updateNoticeById = async (req: Request, res: Response) => {
  upload.single('attachment')(req, res, async (err: any) => {
    if (err) {
      console.error(err);
      if (err instanceof multer.MulterError) {
        return sendError(res, 400, 'File upload error: ' + err.message);
      } else {
        return sendError(res, 500, 'Failed to upload attachment');
      }
    }

    const { id } = req.params;
    const { title, noticeDate, publishOn, messageTo, message } = req.body;
    const attachment = req.file ? req.file.path : null;

    try {
      const noticeRepository = AppDataSource.getRepository(Notice);
      const notice = await noticeRepository.findOne({
        where: { id: parseInt(id, 10) },
      });
      if (!notice) {
        return sendError(res, 404, 'Notice not found');
      }
      notice.title = title || notice.title;
      notice.noticeDate = noticeDate || notice.noticeDate;
      notice.publishOn = publishOn || notice.publishOn;
      notice.messageTo = messageTo || notice.messageTo;
      notice.message = message || notice.message;
      notice.attachment = attachment || notice.attachment;
      await noticeRepository.save(notice);
      return sendResponse(res, 200, 'Notice updated successfully', notice);
    } catch (error) {
      console.error(error);
      return sendError(res, 500, 'Failed to update notice');
    }
  });
};

// Delete notice by ID
const deleteNoticeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const noticeRepository = AppDataSource.getRepository(Notice);
    const notice = await noticeRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!notice) {
      return sendError(res, 404, 'Notice not found');
    }
    await noticeRepository.remove(notice);
    return sendResponse(res, 200, 'Notice deleted successfully');
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Failed to delete notice');
  }
};

export {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNoticeById,
  deleteNoticeById,
};
