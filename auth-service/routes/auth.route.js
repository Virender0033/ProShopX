import express from 'express';
import { userRegister, userLogin, getMe } from '../controllers/auth.controller.js';
import authmiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', userRegister);
router.post('/login', userLogin);
router.get('/me', authmiddleware, getMe);

export default router;