import { z } from "zod";

const imageSchema = z.object({
  imageUrl: z.string().trim().url("Image URL must be a valid URL"),
  isPrimary: z.boolean().optional().default(false),
});

const ticketTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ticket type name is required")
    .max(100, "Ticket type name is too long"),

  description: z
    .string()
    .trim()
    .max(500, "Ticket description is too long")
    .optional()
    .nullable(),

  price: z.coerce.number().nonnegative("Ticket price cannot be negative"),

  quantity: z.coerce
    .number()
    .int("Ticket quantity must be a whole number")
    .positive("Ticket quantity must be greater than zero"),

  saleStart: z.coerce.date().optional().nullable(),

  saleEnd: z.coerce.date().optional().nullable(),
});

/**
 * Used when updating an event.
 * Existing ticket types need their ID so the backend
 * knows whether to update or create a ticket type.
 */
const updateTicketTypeSchema = ticketTypeSchema.extend({
  id: z.string().uuid("Ticket type ID must be a valid UUID").optional(),
});

export const createEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Event title must be at least 3 characters")
      .max(200, "Event title is too long"),

    description: z
      .string()
      .trim()
      .min(10, "Event description must be at least 10 characters"),

    categoryId: z.string().uuid("Category ID must be a valid UUID"),

    venue: z
      .string()
      .trim()
      .min(2, "Venue is required")
      .max(200, "Venue name is too long"),

    address: z
      .string()
      .trim()
      .min(2, "Address is required")
      .max(300, "Address is too long"),

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),

    status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("DRAFT"),

    images: z.array(imageSchema).optional().default([]),

    ticketTypes: z.array(ticketTypeSchema).optional().default([]),
  })
  .superRefine((data, ctx) => {
    // Event date validation
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }

    // Only one primary image is allowed
    const primaryImages = data.images.filter(
      (image) => image.isPrimary === true,
    );

    if (primaryImages.length > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["images"],
        message: "Only one image can be marked as primary",
      });
    }

    // Ticket sales date validation
    for (let index = 0; index < data.ticketTypes.length; index += 1) {
      const ticketType = data.ticketTypes[index];

      if (
        ticketType.saleStart &&
        ticketType.saleEnd &&
        ticketType.saleEnd <= ticketType.saleStart
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["ticketTypes", index, "saleEnd"],
          message: "Ticket sale end must be after sale start",
        });
      }
    }
  });

export const updateEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Event title must be at least 3 characters")
      .max(200, "Event title is too long")
      .optional(),

    description: z
      .string()
      .trim()
      .min(10, "Event description must be at least 10 characters")
      .optional(),

    categoryId: z.string().uuid("Category ID must be a valid UUID").optional(),

    venue: z
      .string()
      .trim()
      .min(2, "Venue is required")
      .max(200, "Venue name is too long")
      .optional(),

    address: z
      .string()
      .trim()
      .min(2, "Address is required")
      .max(300, "Address is too long")
      .optional(),

    startDate: z.coerce.date().optional(),

    endDate: z.coerce.date().optional(),

    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),

    images: z.array(imageSchema).optional(),

    // IMPORTANT:
    // Update ticket types use updateTicketTypeSchema
    // so existing ticket IDs are preserved.
    ticketTypes: z.array(updateTicketTypeSchema).optional(),
  })
  .superRefine((data, ctx) => {
    // Event date validation
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }

    // Image validation
    if (data.images) {
      const primaryImages = data.images.filter(
        (image) => image.isPrimary === true,
      );

      if (primaryImages.length > 1) {
        ctx.addIssue({
          code: "custom",
          path: ["images"],
          message: "Only one image can be marked as primary",
        });
      }
    }

    // Ticket validation
    if (data.ticketTypes) {
      for (let index = 0; index < data.ticketTypes.length; index += 1) {
        const ticketType = data.ticketTypes[index];

        if (
          ticketType.saleStart &&
          ticketType.saleEnd &&
          ticketType.saleEnd <= ticketType.saleStart
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["ticketTypes", index, "saleEnd"],
            message: "Ticket sale end must be after sale start",
          });
        }
      }
    }
  });

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name is too long"),
});
