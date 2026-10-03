import prisma from "../config/database.js";

export async function getOrganizerAnalytics(userId, role) {
  if (!userId) {
    const error = new Error("User ID is required.");
    error.statusCode = 400;
    throw error;
  }

  const eventFilter =
    role === "ADMIN"
      ? {}
      : {
          organizerId: userId,
        };

  const [
    totalEvents,
    publishedEvents,
    draftEvents,
    cancelledEvents,
    upcomingEvents,
    paidOrders,
    ticketCount,
    checkedInTickets,
    revenueResult,
  ] = await Promise.all([
    prisma.event.count({
      where: eventFilter,
    }),

    prisma.event.count({
      where: {
        ...eventFilter,
        status: "PUBLISHED",
      },
    }),

    prisma.event.count({
      where: {
        ...eventFilter,
        status: "DRAFT",
      },
    }),

    prisma.event.count({
      where: {
        ...eventFilter,
        status: "CANCELLED",
      },
    }),

    prisma.event.count({
      where: {
        ...eventFilter,
        status: "PUBLISHED",
        startDate: {
          gte: new Date(),
        },
      },
    }),

    prisma.order.count({
      where: {
        status: "PAID",
        event: eventFilter,
      },
    }),

    prisma.ticket.count({
      where: {
        event: eventFilter,
      },
    }),

    prisma.ticket.count({
      where: {
        event: eventFilter,
        status: "USED",
      },
    }),

    prisma.order.aggregate({
      where: {
        status: "PAID",
        event: eventFilter,
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  return {
    totalEvents,
    publishedEvents,
    draftEvents,
    cancelledEvents,
    upcomingEvents,
    paidOrders,
    ticketsSold: ticketCount,
    checkedInTickets,
    revenue: Number(revenueResult._sum.totalAmount || 0),
  };
}
