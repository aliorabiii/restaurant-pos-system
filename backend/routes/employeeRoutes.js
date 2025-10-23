import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
  getEmployeeStats
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Statistics route (must be before /:id route)
router.get('/stats', authorize('main_admin', 'admin', 'manager', 'accountant'), getEmployeeStats);

// CRUD routes
router.get('/', authorize('main_admin', 'admin', 'manager'), getAllEmployees);
router.get('/:id', authorize('main_admin', 'admin', 'manager'), getEmployeeById);
router.post('/', authorize('main_admin', 'admin', 'manager'), createEmployee);
router.put('/:id', authorize('main_admin', 'admin', 'manager'), updateEmployee);
router.delete('/:id', authorize('main_admin', 'admin'), deleteEmployee);

// Toggle status
router.patch('/:id/toggle-status', authorize('main_admin', 'admin', 'manager'), toggleEmployeeStatus);

export default router;