import { Router } from 'express';
import { requireAuth, requireOrganizerOrAdmin } from '../middleware/auth.js';
import {
  listTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  getTicketType,
} from '../services/ticketTypeService.js';

const router = Router();

// 1. Get all ticket types (filtered by eventId if passed as query param)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const data = await listTicketTypes(req.query.eventId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// 2. Create a new ticket type (Organizer or Admin only)
router.post('/', requireAuth, requireOrganizerOrAdmin, async (req, res, next) => {
  try {
    const data = await createTicketType(req.body || {}, req.user.id);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// 3. Get remaining availability for a specific ticket type
router.get('/:id/availability', requireAuth, async (req, res, next) => {
  try {
    const ticketType = await getTicketType(req.params.id);
    if (!ticketType) {
      return res.status(404).json({ success: false, message: 'Ticket type not found.' });
    }

    // Calculated using schema fields: quantity minus quantitySold
    const remaining = Math.max(0, ticketType.quantity - ticketType.quantitySold);

    return res.status(200).json({
      success: true,
      data: {
        ticketTypeId: req.params.id,
        quantity: ticketType.quantity,
        quantitySold: ticketType.quantitySold,
        remaining,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 4. Update a ticket type (Organizer or Admin only)
router.put('/:id', requireAuth, requireOrganizerOrAdmin, async (req, res, next) => {
  try {
    const data = await updateTicketType(req.params.id, req.body || {}, req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// 5. Delete / deactivate a ticket type (Organizer or Admin only)
router.delete('/:id', requireAuth, requireOrganizerOrAdmin, async (req, res, next) => {
  try {
    await deleteTicketType(req.params.id, req.user.id);
    return res.status(200).json({ success: true, message: 'Ticket type deactivated.' });
  } catch (error) {
    next(error);
  }
});

export default router;