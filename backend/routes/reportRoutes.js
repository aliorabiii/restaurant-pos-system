import express from 'express';
import {
  getOverviewStats,
  getRevenueOverTime,
  getSalesByCategory,
  getTopProducts,
  getPaymentMethodsBreakdown,
  getSalesByHour,
  getSalesByDayOfWeek
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes accessible by admin, manager, and accountant
router.get('/overview', authorize('main_admin', 'admin', 'manager', 'accountant'), getOverviewStats);
router.get('/revenue-over-time', authorize('main_admin', 'admin', 'manager', 'accountant'), getRevenueOverTime);
router.get('/sales-by-category', authorize('main_admin', 'admin', 'manager', 'accountant'), getSalesByCategory);
router.get('/top-products', authorize('main_admin', 'admin', 'manager', 'accountant'), getTopProducts);
router.get('/payment-methods', authorize('main_admin', 'admin', 'manager', 'accountant'), getPaymentMethodsBreakdown);
router.get('/sales-by-hour', authorize('main_admin', 'admin', 'manager', 'accountant'), getSalesByHour);
router.get('/sales-by-day', authorize('main_admin', 'admin', 'manager', 'accountant'), getSalesByDayOfWeek);

export default router;