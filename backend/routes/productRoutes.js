import express from "express";
import multer from "multer";
import path from "path";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

// Public read routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes for admin/manager
router.use(protect);
router.use(authorize("main_admin", "admin", "manager"));

// Make sure you have ONLY ONE POST route for creating products
router.post("/", upload.array("images", 5), createProduct);
router.put("/:id", upload.array("images", 5), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
