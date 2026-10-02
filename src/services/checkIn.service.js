import prisma from "../config/database.js";

export async function checkInTicketByQr(qrCode) {
  if (!qrCode || typeof qrCode !== "string") {
    const error = new Error("QR code is required.");
    error.statusCode = 400;
    throw error;
  }

  const ticket = await prisma.ticket.findUnique({
    where: {
      qrCode,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          venue: true,
          address: true,
          startDate: true,
        },
      },
      ticketType: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!ticket) {
    const error = new Error("Invalid QR code or ticket not found.");
    error.statusCode = 404;
    throw error;
  }

  if (ticket.status === "USED") {
    const error = new Error("This ticket has already been checked in.");
    error.statusCode = 409;
    throw error;
  }

  if (ticket.status === "CANCELLED") {
    const error = new Error("This ticket has been cancelled.");
    error.statusCode = 400;
    throw error;
  }

  if (ticket.status !== "ACTIVE") {
    const error = new Error(
      `Ticket cannot be checked in because its status is ${ticket.status}.`,
    );
    error.statusCode = 400;
    throw error;
  }

  const checkedInTicket = await prisma.ticket.update({
    where: {
      id: ticket.id,
    },
    data: {
      status: "USED",
      checkedInAt: new Date(),
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          venue: true,
          address: true,
          startDate: true,
        },
      },
      ticketType: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return checkedInTicket;
}
