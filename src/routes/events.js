import express from "express";
import prisma from "../config/database.js";
import { authenticate } from "../middleware/auth.middleware.js"; // Adjust relative path if needed

const router = express.Router();

// POST /api/events — create an event
router.post("/", authenticate, async (req, res, next) => {
  try {
    const {
      organizerId,
      categoryId,
      title,
      description,
      venue,
      address,
      startDate,
      endDate,
    } = req.body;

    // Grab user ID from decoded token first, fallback to req.body.organizerId
    const finalOrganizerId = req.user?.id || organizerId;

    if (!finalOrganizerId) {
      return res.status(400).json({
        success: false,
        message: "Organizer ID is required.",
        data: null,
      });
    }

    const newEvent = await prisma.event.create({
      data: {
        organizerId: finalOrganizerId,
        ...(categoryId ? { categoryId } : {}), // Only attach categoryId if provided
        title,
        description,
        venue,
        address,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events — list all events
router.get("/", async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        category: true,
        ticketTypes: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id — retrieve single event
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        ticketTypes: true,
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/events/:id — update event
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Remove immutable fields if present in req.body
    const { id: _, organizerId: __, ...updateData } = req.body;

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/:id — delete event
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.event.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;