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
 * Get all published events.
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
 * Get one published event by ID.
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
 * Get events managed by the current organizer.
 * ADMIN can see all events.
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
 * Create an event.
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
 * Find an event and confirm that the user is allowed
 * to manage it.
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
 * Update an event and its ticket types.
 *
 * Existing ticket types are identified by their ID.
 * New ticket types have no ID.
 */
export async function updateEvent(id, userId, role, eventData) {
  await findEventForManagement(id, userId, role);

  const existingEvent = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      ticketTypes: true,
    },
  });

  if (!existingEvent) {
    throw createServiceError("Event not found", 404);
  }

  /**
   * Validate category before starting the transaction.
   */
  if (eventData.categoryId !== undefined) {
    const category = await prisma.eventCategory.findUnique({
      where: {
        id: eventData.categoryId,
      },
    });

    if (!category) {
      throw createServiceError("Event category not found", 404);
    }
  }

  /**
   * Build the basic event update.
   */
  const data = {};

  if (eventData.title !== undefined) {
    data.title = eventData.title;
  }

  if (eventData.description !== undefined) {
    data.description = eventData.description;
  }

  if (eventData.categoryId !== undefined) {
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

  return prisma.$transaction(async (tx) => {
    /**
     * Update basic event information.
     */
    await tx.event.update({
      where: {
        id,
      },
      data,
    });

    /**
     * Only modify ticket types when the frontend
     * actually sends ticketTypes.
     */
    if (Array.isArray(eventData.ticketTypes)) {
      const incomingTicketIds = eventData.ticketTypes
        .filter((ticketType) => ticketType.id)
        .map((ticketType) => ticketType.id);

      const incomingIds = new Set(incomingTicketIds);

      /**
       * Delete existing ticket types that are no
       * longer present in the form.
       *
       * We only allow deletion when nothing has
       * been sold from that ticket type.
       */
      for (const existingTicketType of existingEvent.ticketTypes) {
        if (
          !incomingIds.has(existingTicketType.id) &&
          existingTicketType.quantitySold === 0
        ) {
          await tx.ticketType.delete({
            where: {
              id: existingTicketType.id,
            },
          });
        }
      }

      /**
       * Update existing ticket types or create
       * new ones.
       */
      for (const ticketType of eventData.ticketTypes) {
        /**
         * EXISTING TICKET TYPE
         */
        if (ticketType.id) {
          const existingTicketType = existingEvent.ticketTypes.find(
            (item) => item.id === ticketType.id,
          );

          if (!existingTicketType) {
            throw createServiceError(
              "One of the selected ticket types does not belong to this event",
              400,
            );
          }

          /**
           * Do not allow the organizer to reduce
           * total quantity below tickets already sold.
           */
          if (ticketType.quantity < existingTicketType.quantitySold) {
            throw createServiceError(
              `Quantity for "${existingTicketType.name}" cannot be less than tickets already sold.`,
              400,
            );
          }

          await tx.ticketType.update({
            where: {
              id: ticketType.id,
            },

            data: {
              name: ticketType.name,

              description: ticketType.description ?? null,

              price: ticketType.price.toString(),

              quantity: ticketType.quantity,

              saleStart: ticketType.saleStart ?? null,

              saleEnd: ticketType.saleEnd ?? null,
            },
          });
        } else {
          /**
           * NEW TICKET TYPE
           */
          await tx.ticketType.create({
            data: {
              eventId: id,

              name: ticketType.name,

              description: ticketType.description ?? null,

              price: ticketType.price.toString(),

              quantity: ticketType.quantity,

              saleStart: ticketType.saleStart ?? null,

              saleEnd: ticketType.saleEnd ?? null,
            },
          });
        }
      }
    }

    /**
     * Return the fully updated event.
     */
    return tx.event.findUnique({
      where: {
        id,
      },
      include: eventDetailInclude,
    });
  });
}

/**
 * Cancel an event.
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
 * Create a category.
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
