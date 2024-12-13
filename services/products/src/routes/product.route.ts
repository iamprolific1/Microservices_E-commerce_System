import express from 'express';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, validateProducts } from '../controllers/product.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { rateLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.post('/create', authenticate, rateLimiter, createProduct);
router.get('/', authenticate, rateLimiter, getAllProducts);
router.get('/:id', authenticate, rateLimiter, getProductById);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.post('/validate', authenticate, rateLimiter, validateProducts);

export default router;