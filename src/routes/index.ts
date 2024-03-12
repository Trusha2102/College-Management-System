import express from 'express';
import roleRoutes from './permissions/roleRoutes';
import moduleRoutes from './modules/moduleRoutes';
import permissionRoutes from './permissions/permissionRoutes';

const router = express.Router();

router.use('/roles', roleRoutes);
router.use('/module', moduleRoutes);
router.use('/permission', permissionRoutes);

export default router;
