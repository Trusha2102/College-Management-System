import express from 'express';
import * as noticeController from '../../controllers/notice/noticeController';
import permissionProtect from '../../middlewares/permissionMiddleware';

const router = express.Router();

router.post('/add', permissionProtect, noticeController.createNotice);
router.get('/list', permissionProtect, noticeController.getAllNotices);
router.get('/view/:id', permissionProtect, noticeController.getNoticeById);
router.put('/update/:id', permissionProtect, noticeController.updateNoticeById);
router.delete(
  '/delete/:id',
  permissionProtect,
  noticeController.deleteNoticeById,
);

export default router;
