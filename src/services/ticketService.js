import crypto from 'crypto';
import { TicketStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { signQrPayload, verifyQrPayload, decodeQrPayload } from './qrService.js';

// ... keep existing helper functions (canReserveQuantity, isWithinSalesWindow, validatePurchase)

export async function generateTicketsForOrder({ orderItemId, ticketTypeId, eventId, userId, quantity }, tx = prisma) {
  const createdTickets = [];

  for (let index = 0; index < quantity; index += 1) {
    const ticketId = crypto.randomUUID();
    const ticketNumber = `TCK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const qrCode = signQrPayload({
      ticketId,
      ticketNumber,
      eventId,
      exp: Math.floor(Date.now() / 1000) + (3600 * 24 * 30),
    });

    const ticket = await tx.ticket.create({
      data: {
        id: ticketId,
        ticketNumber,
        orderItemId,
        ticketTypeId,
        eventId,
        userId,
        status: TicketStatus.ACTIVE || 'ACTIVE',
        qrCode,
      },
    });

    createdTickets.push(ticket);
  }

  return createdTickets;
}

export async function checkInTicketByQr(qrToken) {
  if (!verifyQrPayload(qrToken)) {
    const error = new Error('Invalid or expired QR code.');
    error.statusCode = 400;
    throw error;
  }

  const payload = decodeQrPayload(qrToken);

  const ticket = await prisma.ticket.findFirst({
    where: {
      OR: [
        ...(payload?.ticketId ? [{ id: payload.ticketId }] : []),
        { qrCode: qrToken },
      ],
    },
  });

  if (!ticket) {
    const error = new Error('Ticket not found.');
    error.statusCode = 404;
    throw error;
  }

  if (ticket.status === TicketStatus.CHECKED_IN || ticket.status === 'CHECKED_IN' || ticket.status === 'USED') {
    const error = new Error('Ticket has already been used.');
    error.statusCode = 409;
    throw error;
  }

  if (ticket.status !== TicketStatus.ACTIVE && ticket.status !== 'ACTIVE') {
    const error = new Error(`Ticket cannot be checked in because it is ${ticket.status}.`);
    error.statusCode = 400;
    throw error;
  }

  return prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: TicketStatus.CHECKED_IN,
      checkedInAt: new Date(),
    },
  });
}