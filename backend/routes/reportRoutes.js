import express from 'express';
import {
  getOverviewStats,
  getRevenueOverTime,
  getSalesByCategory,
  getTopProducts,
  getPaymentMethodsBreakdown,
  getSalesByHour,
  getSalesByDayOfWeek,
  getExpenseOverview,
  getExpensesByCategory,
  getExpensesOverTime,
  getTopExpenseCategories,
  getFinancialSummary
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

const authorizedRoles = ['main_admin', 'admin', 'manager', 'accountant'];

// Sales & Revenue routes
router.get('/overview', authorize(...authorizedRoles), getOverviewStats);
router.get('/revenue-over-time', authorize(...authorizedRoles), getRevenueOverTime);
router.get('/sales-by-category', authorize(...authorizedRoles), getSalesByCategory);
router.get('/top-products', authorize(...authorizedRoles), getTopProducts);
router.get('/payment-methods', authorize(...authorizedRoles), getPaymentMethodsBreakdown);
router.get('/sales-by-hour', authorize(...authorizedRoles), getSalesByHour);
router.get('/sales-by-day', authorize(...authorizedRoles), getSalesByDayOfWeek);

// Expense routes
router.get('/expense-overview', authorize(...authorizedRoles), getExpenseOverview);
router.get('/expenses-by-category', authorize(...authorizedRoles), getExpensesByCategory);
router.get('/expenses-over-time', authorize(...authorizedRoles), getExpensesOverTime);
router.get('/top-expense-categories', authorize(...authorizedRoles), getTopExpenseCategories);
router.get('/financial-summary', authorize(...authorizedRoles), getFinancialSummary);

export default router;