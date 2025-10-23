import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createCategory,
  getCategories,
  getMainCategories,
  getSubcategories,
} from "../controllers/categoryController.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/main", getMainCategories);
router.get("/subcategories/:parentId", getSubcategories);

// Protected admin routes
router.use(protect);
router.use(authorize("main_admin", "admin"));

router.post("/", createCategory);

export default router;
