import prisma from '../lib/prisma.js';

function toTicketTypeData(input) {
  const data = {
    eventId: input.eventId,
    name: input.name,
    description: input.description,
    price: input.price,
    quantity: Number(input.quantity ?? input.totalQuantity),
    saleStart: (input.saleStart || input.salesStart) 
      ? new Date(input.saleStart || input.salesStart) 
      : null,
    saleEnd: (input.saleEnd || input.salesEnd) 
      ? new Date(input.saleEnd || input.salesEnd) 
      : null,
  };

  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

export async function listTicketTypes(eventId) {
  return prisma.ticketType.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTicketType(input, organizerId) {
  const event = await prisma.event.findFirst({ where: { id: input.eventId, organizerId } });
  if (!event) {
    const error = new Error('Event not found or organizer access denied.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.ticketType.create({ data: toTicketTypeData(input) });
}

export async function updateTicketType(id, input, organizerId) {
  const ticketType = await prisma.ticketType.findFirst({ where: { id, event: { organizerId } } });
  if (!ticketType) {
    const error = new Error('Ticket type not found or organizer access denied.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.ticketType.update({ where: { id }, data: toTicketTypeData(input) });
}

export async function deleteTicketType(id, organizerId) {
  const ticketType = await prisma.ticketType.findFirst({ where: { id, event: { organizerId } } });
  if (!ticketType) {
    const error = new Error('Ticket type not found or organizer access denied.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.ticketType.delete({ where: { id } });
}

export async function getTicketType(id) {
  return prisma.ticketType.findUnique({ where: { id } });
}