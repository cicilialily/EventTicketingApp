const { signQrPayload, generateQrPng, verifyQrPayload } = require('../services/qrService');
const { verifyTicketQrPayload, checkInTicket } = require('../services/ticketService');

async function getTicketQr(req, res) {
  const token = signQrPayload({
    ticketId: req.params.id,
    eventId: 'event_generated',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  const imageBuffer = await generateQrPng(token);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `inline; filename="ticket-${req.params.id}.png"`);
  return res.status(200).send(imageBuffer);
}

async function checkInTicketController(req, res) {
  const token = req.body.qrPayload || req.body.qrToken;

  if (!verifyTicketQrPayload(token) && !verifyQrPayload(token)) {
    return res.status(400).json({ success: false, message: 'Invalid or expired QR signature.' });
  }

  const ticket = checkInTicket({ id: req.params.id, status: 'VALID' });

  if (ticket.status === 'USED') {
    return res.status(200).json({ success: true, data: ticket });
  }

  return res.status(409).json({ success: false, message: 'Ticket is already used, cancelled, or expired.' });
}

module.exports = { getTicketQr, checkInTicketController };
