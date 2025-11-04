import express from 'express';
import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getDailyTotal
} from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Statistics routes (must be before /:id route)
router.get('/stats', authorize('main_admin', 'admin', 'manager', 'accountant'), getExpenseStats);
router.get('/daily-total', authorize('main_admin', 'admin', 'manager', 'accountant'), getDailyTotal);

// CRUD routes
router.get('/', authorize('main_admin', 'admin', 'manager', 'accountant'), getAllExpenses);
router.get('/:id', authorize('main_admin', 'admin', 'manager', 'accountant'), getExpenseById);
router.post('/', authorize('main_admin', 'admin', 'manager', 'accountant'), createExpense);
router.put('/:id', authorize('main_admin', 'admin', 'manager', 'accountant'), updateExpense);
router.delete('/:id', authorize('main_admin', 'admin'), deleteExpense);

export default router;