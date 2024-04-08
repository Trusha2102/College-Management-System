import express from 'express';
import * as noticeController from '../../controllers/notice/noticeController';
// import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', noticeController.createNotice);
router.get('/list', noticeController.getAllNotices);
router.get('/view/:id', noticeController.getNoticeById);
router.put('/update/:id', noticeController.updateNoticeById);
router.delete(
  '/delete/:id',

  noticeController.deleteNoticeById,
);

export default router;
