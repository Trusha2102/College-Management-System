import express from 'express';
import * as parentsDetailsController from '../../controllers/student/parentsDetailsController';

const router = express.Router();

router.post('/add', parentsDetailsController.createParentDetails);
router.get('/view/:id', parentsDetailsController.getParentDetailsById);
router.put('/update/:id', parentsDetailsController.updateParentDetailsById);
router.delete('/delete/:id', parentsDetailsController.deleteParentDetailsById);

export default router;
