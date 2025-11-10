import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";


import {
  createOrder,
  getOrders,
  getOrderById,
  getDailySales,
  updateDeliveryStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// Public routes (if any) would go here

// Protected routes
router.use(protect);

// Clerk and above can create orders
router.post(
  "/",
  authorize("main_admin", "admin", "manager", "clerk"),
  createOrder
);

// Manager and above can view orders and reports
router.get(
  "/",
  authorize("main_admin", "admin", "manager", "accountant"),
  getOrders
);
router.get(
  "/daily-sales",
  authorize("main_admin", "admin", "manager", "accountant"),
  getDailySales
);
router.get(
  "/:id",
  authorize("main_admin", "admin", "manager", "accountant"),
  getOrderById
);

router.put(
  "/:id/delivery-out",
  authorize("main_admin", "admin", "manager", "clerk"),
  updateDeliveryStatus("out")
);

router.put(
  "/:id/delivery-delivered", 
  authorize("main_admin", "admin", "manager", "clerk"),
  updateDeliveryStatus("delivered")
);


export default router;
