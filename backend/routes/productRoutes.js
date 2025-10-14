import express from 'express';
import {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);
router.post('/', createProduct);

export default router;