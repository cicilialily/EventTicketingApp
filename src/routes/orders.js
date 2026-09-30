import { Router } from 'express';
import { createOrder, payOrder } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, createOrder);
router.post('/:id/pay', authenticate, payOrder);

export default router;