const express = require('express');
const router = express.Router();
const { requireAuth, requireOrganizerOrStaff } = require('../middleware/auth');
const { getTicketQr, checkInTicketController } = require('../controllers/ticketController');

router.get('/:id/qr', requireAuth, getTicketQr);
router.post('/:id/check-in', requireAuth, requireOrganizerOrStaff, checkInTicketController);

module.exports = router;
