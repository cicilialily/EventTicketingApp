import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUserPurchaseHistory } from '../controllers/user.controller.js';

const router = Router();

router.get('/:id/orders', requireAuth, getUserPurchaseHistory);

export default router;
