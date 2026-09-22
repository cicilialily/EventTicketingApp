const express = require('express');
const router = express.Router();
const { requireAuth, requireOrganizerOrStaff } = require('../middleware/auth');
const { getTicketTypeAvailability } = require('../services/orderService');
const {
  listTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  getTicketType,
} = require('../services/ticketTypeService');

router.get('/', requireAuth, async (req, res) => {
  const data = await listTicketTypes(req.query.eventId);
  return res.status(200).json({ success: true, data });
});

router.post('/', requireAuth, requireOrganizerOrStaff, async (req, res) => {
  const data = await createTicketType(req.body || {}, req.user.id);
  return res.status(201).json({ success: true, data });
});

router.get('/:id/availability', requireAuth, async (req, res) => {
  const ticketType = await getTicketType(req.params.id);
  if (!ticketType) {
    return res.status(404).json({ success: false, message: 'Ticket type not found.' });
  }

  return res.status(200).json({
    success: true,
    data: { ticketTypeId: req.params.id, remaining: getTicketTypeAvailability(ticketType) },
  });
});

router.put('/:id', requireAuth, requireOrganizerOrStaff, async (req, res) => {
  const data = await updateTicketType(req.params.id, req.body || {}, req.user.id);
  return res.status(200).json({ success: true, data });
});

router.delete('/:id', requireAuth, requireOrganizerOrStaff, async (req, res) => {
  await deleteTicketType(req.params.id, req.user.id);
  return res.status(200).json({ success: true, message: 'Ticket type deactivated.' });
});

module.exports = router;
