const express = require('express');
const router = express.Router();
import * as userLogin from '../../controllers/auth/userLogin';

// Create a new role
router.post('/', userLogin.login);

export default router;
