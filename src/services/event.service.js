import prisma from "../config/database.js";

const eventListInclude = {
  category: true,
  organizer: {
    select: {
      id: true,
      name: true,
    },
  },
  images: {
    orderBy: {
      createdAt: "asc",
    },
  },
};

const eventDetailInclude = {
  category: true,
  organizer: {
    select: {
      id: true,
      name: true,
    },
  },
  images: {
    orderBy: {
      createdAt: "asc",
    },
  },
  ticketTypes: {
    orderBy: {
      price: "asc",
    },
  },
};

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Get all publicly visible events.
 */
export async function getPublishedEvents({ search, categoryId } = {}) {
  const where = {
    status: "PUBLISHED",
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search?.trim()) {
    const searchTerm = search.trim();

    where.OR = [
      {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        venue: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        address: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  return prisma.event.findMany({
    where,
    include: eventListInclude,
    orderBy: {
      startDate: "asc",
    },
  });
}

/**
 * Get one publicly visible event.
 */
export async function getPublishedEventById(id) {
  const event = await prisma.event.findFirst({
    where: {
      id,
      status: "PUBLISHED",
    },
    include: eventDetailInclude,
  });

  if (!event) {
    throw createServiceError("Event not found", 404);
  }

  return event;
}

/**
 * Get events managed by the authenticated organizer/admin.
 *
 * Organizers see only their own events.
 * Admins see all events.
 */
export async function getManagedEvents(userId, role) {
  const where =
    role === "ADMIN"
      ? {}
      : {
          organizerId: userId,
        };

  return prisma.event.findMany({
    where,
    include: eventDetailInclude,
    orderBy: {
      startDate: "asc",
    },
  });
}

/**
 * Create an event for the authenticated organizer.
 */
export async function createEvent(organizerId, eventData) {
  const category = await prisma.eventCategory.findUnique({
    where: {
      id: eventData.categoryId,
    },
  });

  if (!category) {
    throw createServiceError("Event category not found", 404);
  }

  const {
    title,
    description,
    categoryId,
    venue,
    address,
    startDate,
    endDate,
    status,
    images,
    ticketTypes,
  } = eventData;

  return prisma.event.create({
    data: {
      organizerId,
      categoryId,
      title,
      description,
      venue,
      address,
      startDate,
      endDate,
      status,

      images:
        images?.length > 0
          ? {
              create: images.map((image) => ({
                imageUrl: image.imageUrl,
                isPrimary: image.isPrimary ?? false,
              })),
            }
          : undefined,

      ticketTypes:
        ticketTypes?.length > 0
          ? {
              create: ticketTypes.map((ticketType) => ({
                name: ticketType.name,
                description: ticketType.description ?? null,
                price: ticketType.price.toString(),
                quantity: ticketType.quantity,
                saleStart: ticketType.saleStart ?? null,
                saleEnd: ticketType.saleEnd ?? null,
              })),
            }
          : undefined,
    },

    include: eventDetailInclude,
  });
}

/**
 * Check whether a user owns an event.
 */
async function findEventForManagement(id, userId, role) {
  const event = await prisma.event.findUnique({
    where: {
      id,
    },
  });

  if (!event) {
    throw createServiceError("Event not found", 404);
  }

  if (role !== "ADMIN" && event.organizerId !== userId) {
    throw createServiceError(
      "You do not have permission to manage this event",
      403,
    );
  }

  return event;
}

/**
 * Update an event.
 *
 * Ticket types and images are intentionally not replaced here.
 * They have their own database relations and ticket/order records,
 * so changing them will be handled separately in the ticket module.
 */
export async function updateEvent(id, userId, role, eventData) {
  await findEventForManagement(id, userId, role);

  const data = {};

  if (eventData.title !== undefined) {
    data.title = eventData.title;
  }

  if (eventData.description !== undefined) {
    data.description = eventData.description;
  }

  if (eventData.categoryId !== undefined) {
    const category = await prisma.eventCategory.findUnique({
      where: {
        id: eventData.categoryId,
      },
    });

    if (!category) {
      throw createServiceError("Event category not found", 404);
    }

    data.categoryId = eventData.categoryId;
  }

  if (eventData.venue !== undefined) {
    data.venue = eventData.venue;
  }

  if (eventData.address !== undefined) {
    data.address = eventData.address;
  }

  if (eventData.startDate !== undefined) {
    data.startDate = eventData.startDate;
  }

  if (eventData.endDate !== undefined) {
    data.endDate = eventData.endDate;
  }

  if (eventData.status !== undefined) {
    data.status = eventData.status;
  }

  return prisma.event.update({
    where: {
      id,
    },
    data,
    include: eventDetailInclude,
  });
}

/**
 * Cancel an event instead of deleting it permanently.
 */
export async function cancelEvent(id, userId, role) {
  await findEventForManagement(id, userId, role);

  return prisma.event.update({
    where: {
      id,
    },
    data: {
      status: "CANCELLED",
    },
    include: eventDetailInclude,
  });
}

/**
 * Get all event categories.
 */
export async function getCategories() {
  return prisma.eventCategory.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Create an event category.
 */
export async function createCategory(name) {
  const existingCategory = await prisma.eventCategory.findUnique({
    where: {
      name,
    },
  });

  if (existingCategory) {
    throw createServiceError("Event category already exists", 409);
  }

  return prisma.eventCategory.create({
    data: {
      name,
    },
  });
}
