import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin/main_admin role ONLY
router.use(protect);
router.use(authorize('main_admin', 'admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', authorize('main_admin'), deleteUser); // Only main_admin can delete
router.put('/:id/password', changePassword);

export default router;