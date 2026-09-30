import { prisma } from '../lib/prisma.js';
import crypto from 'crypto';

/**
 * Creates an order in PENDING status and increments quantitySold on TicketType.
 */
export async function createOrderTransaction({ userId, eventId, items }) {
  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      // 1. Fetch real TicketType from Prisma schema
      const ticketType = await tx.ticketType.findUnique({
        where: { id: item.ticketTypeId },
      });

      if (!ticketType) {
        throw new Error(`Ticket type ${item.ticketTypeId} is not available.`);
      }

      // 2. Check stock availability
      if (ticketType.quantity - ticketType.quantitySold < item.quantity) {
        throw new Error(`Insufficient tickets remaining for ${ticketType.name}.`);
      }

      const unitPrice = Number(ticketType.price);
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });

      // 3. Update quantity sold on TicketType
      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { quantitySold: { increment: item.quantity } },
      });
    }

    // 4. Create Order & OrderItems matching Prisma Schema
    const order = await tx.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        eventId,
        totalAmount,
        status: 'PENDING',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return order;
  });
}

/**
 * Marks an order as PAID and generates individual Ticket records with QR codes.
 */
export async function markOrderPaidTransaction(orderId) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    if (order.status === 'PAID') {
      throw new Error(`Order ${orderId} is already paid.`);
    }

    // 1. Update status to PAID
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    });

    // 2. Prepare ticket items for batch creation
    const ticketsToCreate = [];

    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketNumber = `TCK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const qrCodeData = `TICKET:${ticketNumber}:${crypto.randomUUID()}`;

        ticketsToCreate.push({
          ticketNumber,
          orderItemId: item.id,
          userId: order.userId,
          eventId: order.eventId,
          ticketTypeId: item.ticketTypeId,
          qrCode: qrCodeData,
          status: 'ACTIVE',
        });
      }
    }

    // 3. Execute batch creation
    if (ticketsToCreate.length > 0) {
      await tx.ticket.createMany({
        data: ticketsToCreate,
      });
    }

    // 4. Return order including items and generated tickets nested via orderItems
    return await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            tickets: true,
          },
        },
      },
    });
  });
}