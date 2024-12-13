import express from 'express';
import { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, getOrderHistory } from '../controllers/order.controller';
import { rateLimiter } from '../middlewares/rateLimiter';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/create', authenticate, rateLimiter, createOrder);
router.get('/', authenticate, rateLimiter, getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id', authenticate, rateLimiter, updateOrderStatus);
router.delete('/:id', authenticate, rateLimiter, deleteOrder);
router.get('/history/:userId', authenticate, getOrderHistory);

export default router;
