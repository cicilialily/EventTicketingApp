const prisma = require('../lib/prisma');
const { signQrPayload } = require('./qrService');

function calculateOrderTotal(items, ticketTypes) {
  return items.reduce((sum, item) => {
    const ticketType = ticketTypes[item.ticketTypeId];
    const unitPrice = Number(ticketType?.price ?? 0);
    const quantity = Number(item.quantity || 0);
    return sum + unitPrice * quantity;
  }, 0);
}

function isTicketTypeAvailable(ticketType, quantityToReserve, now = new Date()) {
  if (!ticketType) return false;

  const remaining = Number(ticketType.totalQuantity ?? 0) - Number(ticketType.quantitySold ?? 0);
  const quantity = Number(quantityToReserve || 0);
  const startOk = !ticketType.salesStart || now >= new Date(ticketType.salesStart);
  const endOk = !ticketType.salesEnd || now <= new Date(ticketType.salesEnd);
  const active = ticketType.isActive !== false;

  return active && startOk && endOk && quantity > 0 && remaining >= quantity;
}

function getTicketTypeAvailability(ticketType) {
  if (!ticketType) return 0;
  return Math.max(Number(ticketType.totalQuantity ?? 0) - Number(ticketType.quantitySold ?? 0), 0);
}

function createOrderForUser({ userId, idempotencyKey, items, ticketTypes }) {
  const totalAmount = calculateOrderTotal(items, ticketTypes);

  return {
    id: `order_${Date.now()}`,
    userId,
    idempotencyKey,
    status: 'PENDING',
    totalAmount,
    items,
    createdAt: new Date().toISOString(),
  };
}

async function createOrderTransaction({ userId, idempotencyKey, items, ticketTypes = [] }) {
  if (!prisma) {
    return createOrderForUser({ userId, idempotencyKey, items, ticketTypes });
  }

  const ticketTypeIds = [...new Set(items.map((item) => item.ticketTypeId))];
  const dbTicketTypes = await prisma.ticketType.findMany({
    where: { id: { in: ticketTypeIds } },
  });

  const typeMap = Object.fromEntries(dbTicketTypes.map((type) => [type.id, type]));
  let totalAmount = 0;

  for (const item of items) {
    const ticketType = typeMap[item.ticketTypeId];
    if (!ticketType) {
      throw new Error(`Ticket type ${item.ticketTypeId} not found.`);
    }
    if (!isTicketTypeAvailable(ticketType, item.quantity, new Date())) {
      throw new Error(`Ticket type ${item.ticketTypeId} is not available for quantity ${item.quantity}.`);
    }
    totalAmount += Number(ticketType.price) * Number(item.quantity || 0);
  }

  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({ where: { idempotencyKey } });
    if (existingOrder) {
      return existingOrder;
    }

    const order = await tx.order.create({
      data: {
        userId,
        idempotencyKey,
        status: 'PENDING',
        totalAmount,
        currency: 'USD',
      },
    });

    const orderItems = [];
    for (const item of items) {
      const ticketType = typeMap[item.ticketTypeId];
      const quantity = Number(item.quantity || 0);
      const subtotal = Number(ticketType.price) * quantity;
      const orderItem = await tx.orderItem.create({
        data: {
          orderId: order.id,
          ticketTypeId: item.ticketTypeId,
          quantity,
          unitPrice: ticketType.price,
          subtotal,
        },
      });

      const maxAllow = ticketType.totalQuantity - quantity;
      const updateResult = await tx.ticketType.updateMany({
        where: {
          id: ticketType.id,
          quantitySold: { lte: maxAllow },
        },
        data: {
          quantitySold: { increment: quantity },
        },
      });

      if (updateResult.count !== 1) {
        throw new Error(`Ticket quantity for ${ticketType.id} could not be reserved.`);
      }

      for (let index = 0; index < quantity; index += 1) {
        const ticket = await tx.ticket.create({
          data: {
            orderItemId: orderItem.id,
            ticketTypeId: item.ticketTypeId,
            eventId: ticketType.eventId,
            ownerUserId: userId,
            status: 'VALID',
            qrPayload: '',
          },
        });

        const qrPayload = signQrPayload({
          ticketId: ticket.id,
          eventId: ticketType.eventId,
          exp: Math.floor(Date.now() / 1000) + 3600,
        });

        await tx.ticket.update({
          where: { id: ticket.id },
          data: { qrPayload },
        });
      }

      orderItems.push({ ...orderItem, ticketTypeId: item.ticketTypeId, quantity });
    }

    return { ...order, items: orderItems, totalAmount, status: 'PENDING' };
  });
}

function markOrderPaid(order, { tickets = [], orderId }) {
  return {
    ...order,
    id: orderId || order.id,
    status: 'PAID',
    paidAt: new Date().toISOString(),
    tickets,
  };
}

async function markOrderPaidTransaction(orderId, ticketCount = 1) {
  if (!prisma) {
    return { id: orderId, status: 'PAID', ticketCount };
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      const error = new Error('Order not found.');
      error.statusCode = 404;
      throw error;
    }
    if (order.status !== 'PENDING' && order.status !== 'PAID') {
      const error = new Error(`Order cannot be paid from ${order.status} status.`);
      error.statusCode = 409;
      throw error;
    }

    const paidOrder = order.status === 'PAID'
      ? order
      : await tx.order.update({ where: { id: orderId }, data: { status: 'PAID' } });
    const tickets = await tx.ticket.findMany({
      where: { orderItemId: { in: order.items.map((item) => item.id) } },
    });

    return { ...paidOrder, tickets };
  });
}

module.exports = {
  calculateOrderTotal,
  isTicketTypeAvailable,
  getTicketTypeAvailability,
  createOrderForUser,
  createOrderTransaction,
  markOrderPaid,
  markOrderPaidTransaction,
};
