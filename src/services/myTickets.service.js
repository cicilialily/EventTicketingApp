import prisma from "../config/database.js";

export async function getMyTickets(userId) {
  if (!userId) {
    const error = new Error("User ID is required.");
    error.statusCode = 400;
    throw error;
  }

  return prisma.ticket.findMany({
    where: {
      userId,
    },

    include: {
      event: {
        select: {
          id: true,
          title: true,
          venue: true,
          address: true,
          startDate: true,
          endDate: true,
          status: true,
          images: {
            where: {
              isPrimary: true,
            },
            take: 1,
            select: {
              imageUrl: true,
            },
          },
        },
      },

      ticketType: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}
