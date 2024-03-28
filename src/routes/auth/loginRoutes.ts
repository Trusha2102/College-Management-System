const express = require('express');
const router = express.Router();
import * as userLogin from '../../controllers/auth/userLogin';

// Create a new role
router.post('/login', userLogin.login);
router.post('/reset-password', userLogin.resetPassword);
router.post('/forgot-password', userLogin.forgotPasswordEmail);

export default router;
