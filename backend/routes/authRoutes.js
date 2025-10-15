import express from 'express';
import {
  register,
  login,
  getMe,
  logout
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);

// Admin only - register new users
router.post('/register', protect, authorize('main_admin', 'admin'), register);

export default router;