const prisma = require('../lib/prisma');

function requirePrisma() {
  if (!prisma) {
    const error = new Error('Database is not configured.');
    error.statusCode = 503;
    throw error;
  }
}

function toTicketTypeData(input) {
  const data = {
    eventId: input.eventId,
    name: input.name,
    description: input.description,
    price: input.price,
    totalQuantity: input.totalQuantity,
    salesStart: input.salesStart ? new Date(input.salesStart) : null,
    salesEnd: input.salesEnd ? new Date(input.salesEnd) : null,
    isActive: input.isActive === undefined ? true : Boolean(input.isActive),
  };

  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

async function listTicketTypes(eventId) {
  requirePrisma();
  return prisma.ticketType.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

async function createTicketType(input, organizerId) {
  requirePrisma();
  const event = await prisma.event.findFirst({ where: { id: input.eventId, organizerId } });
  if (!event) {
    const error = new Error('Event not found or organizer access denied.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.ticketType.create({ data: toTicketTypeData(input) });
}

async function updateTicketType(id, input, organizerId) {
  requirePrisma();
  const ticketType = await prisma.ticketType.findFirst({ where: { id, event: { organizerId } } });
  if (!ticketType) {
    const error = new Error('Ticket type not found or organizer access denied.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.ticketType.update({ where: { id }, data: toTicketTypeData(input) });
}

async function deleteTicketType(id, organizerId) {
  requirePrisma();
  const ticketType = await prisma.ticketType.findFirst({ where: { id, event: { organizerId } } });
  if (!ticketType) {
    const error = new Error('Ticket type not found or organizer access denied.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.ticketType.update({ where: { id }, data: { isActive: false } });
}

async function getTicketType(id) {
  requirePrisma();
  return prisma.ticketType.findUnique({ where: { id } });
}

module.exports = { listTicketTypes, createTicketType, updateTicketType, deleteTicketType, getTicketType };