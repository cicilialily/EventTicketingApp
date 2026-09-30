import * as ticketService from '../services/ticketService.js';
import * as qrService from '../services/qrService.js';
import prisma from '../lib/prisma.js';

export async function getTicketQr(req, res, next) {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const imageBuffer = await qrService.generateQrPng(ticket.qrCode);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="ticket-${ticket.ticketNumber}.png"`);
    return res.status(200).send(imageBuffer);
  } catch (error) {
    next(error);
  }
}

export async function checkInTicketController(req, res, next) {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({ success: false, message: 'QR token payload is required.' });
    }

    const checkedInTicket = await ticketService.checkInTicketByQr(qrCode);

    return res.status(200).json({
      success: true,
      message: 'Attendee successfully checked in.',
      data: checkedInTicket,
    });
  } catch (error) {
    next(error);
  }
}