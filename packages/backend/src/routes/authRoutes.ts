import express from 'express';
import authController from '../controllers/authController';

const router = express.Router();

// Google OAuth login route
router.post('/google', authController.googleLogin.bind(authController));

// Verify JWT token route
router.get('/verify', authController.verifyToken.bind(authController));

export default router;