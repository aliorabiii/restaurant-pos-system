import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getTodayOrders
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/today', getTodayOrders);
router.get('/:id', getOrderById);

export default router;