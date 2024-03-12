import express from 'express';
import roleRoutes from './permissions/roleRoutes';
import moduleRoutes from './modules/moduleRoutes';
import permissionRoutes from './permissions/permissionRoutes';
import userRoutes from './user/userRoutes';

const router = express.Router();

router.use('/roles', roleRoutes);
router.use('/module', moduleRoutes);
router.use('/permission', permissionRoutes);
router.use('/user', userRoutes);

export default router;
