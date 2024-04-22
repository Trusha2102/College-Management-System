import express from 'express';
import * as moduleController from '../../controllers/modules/moduleController';

const router = express.Router();

router.post('/add', moduleController.createModule);
router.get('/list', moduleController.getAllModules);
router.get('/view/:id', moduleController.getModuleById);
router.put('/update', moduleController.updateModuleById);
router.delete('/delete/:id', moduleController.deleteModuleById);

export default router;
