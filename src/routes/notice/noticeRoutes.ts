import express from 'express';
import * as noticeController from '../../controllers/notice/noticeController';

const router = express.Router();

router.post('/', noticeController.createNotice);
router.get('/', noticeController.getAllNotices);
router.get('/:id', noticeController.getNoticeById);
router.put('/:id', noticeController.updateNoticeById);
router.delete('/:id', noticeController.deleteNoticeById);

export default router;
