import express from 'express';
import { createPayment, verifyPayment } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/create', authenticate, createPayment);
router.post('/verify', authenticate, verifyPayment)

export default router;