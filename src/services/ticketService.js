const prisma = require('../lib/prisma');
const { signQrPayload } = require('./qrService');
const { verifyPayload } = require('../utils/signing');

function canReserveQuantity(ticketType, quantityToReserve) {
  const remaining = Number(ticketType.totalQuantity ?? 0) - Number(ticketType.quantitySold ?? 0);
  return quantityToReserve > 0 && remaining >= quantityToReserve;
}

function isWithinSalesWindow(ticketType, now = new Date()) {
  if (!ticketType) return false;
  const startOk = !ticketType.salesStart || now >= new Date(ticketType.salesStart);
  const endOk = !ticketType.salesEnd || now <= new Date(ticketType.salesEnd);
  return ticketType.isActive !== false && startOk && endOk;
}

function validatePurchase(ticketType, quantityToReserve, maxPerOrder = Number(process.env.MAX_TICKETS_PER_ORDER || 8), now = new Date()) {
  if (!ticketType) return false;
  if (quantityToReserve > maxPerOrder) return false;
  if (!isWithinSalesWindow(ticketType, now)) return false;
  return canReserveQuantity(ticketType, quantityToReserve);
}

async function generateTicketsForOrder({ orderId, orderItemId, ticketTypeId, eventId, ownerUserId, quantity }) {
  if (!prisma) {
    return Array.from({ length: quantity }, (_, index) => ({
      id: `ticket_${orderId}_${index}`,
      status: 'VALID',
      orderItemId,
      ticketTypeId,
      eventId,
      ownerUserId,
    }));
  }

  const createdTickets = [];
  for (let index = 0; index < quantity; index += 1) {
    const ticket = await prisma.ticket.create({
      data: {
        orderItemId,
        ticketTypeId,
        eventId,
        ownerUserId,
        status: 'VALID',
        qrPayload: '',
      },
    });

    const qrPayload = signQrPayload({
      ticketId: ticket.id,
      eventId,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { qrPayload },
    });

    createdTickets.push(updatedTicket);
  }

  return createdTickets;
}

function verifyTicketQrPayload(token) {
  if (!token) return false;
  try {
    const [body] = token.split('.');
    if (!body) return false;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (!payload || Number(payload.exp) <= now) return false;
    return verifyPayload(token);
  } catch (error) {
    return false;
  }
}

function checkInTicket(ticket) {
  if (!ticket || !['VALID', 'USED', 'CANCELLED', 'EXPIRED'].includes(ticket.status)) {
    return { ...ticket, status: 'INVALID' };
  }

  if (ticket.status === 'VALID') {
    return { ...ticket, status: 'USED' };
  }

  return { ...ticket, status: ticket.status };
}

module.exports = {
  canReserveQuantity,
  isWithinSalesWindow,
  validatePurchase,
  generateTicketsForOrder,
  verifyTicketQrPayload,
  checkInTicket,
};
