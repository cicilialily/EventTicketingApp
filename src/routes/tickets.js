import { Router } from 'express';
// 1. Import the actual exported functions from ../middleware/auth.js
import { requireAuth, requireOrganizerOrAdmin } from '../middleware/auth.js';
import { getTicketQr, checkInTicketController } from '../controllers/ticketController.js';

const router = Router();

// 2. Use requireAuth instead of authenticate
router.get('/:id/qr', requireAuth, getTicketQr);

// 3. Use requireOrganizerOrStaff instead of authorizeRoles('ORGANIZER', 'ADMIN')
router.post('/check-in', requireAuth, requireOrganizerOrAdmin, checkInTicketController);

export default router;