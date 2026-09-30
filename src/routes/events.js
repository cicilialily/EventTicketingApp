import express from "express";
import prisma from "../config/database.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - organizerId
 *         - categoryId
 *         - title
 *         - description
 *         - venue
 *         - address
 *         - startDate
 *         - endDate
 *       properties:
 *         id:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         organizerId:
 *           type: string
 *           example: "user-123"
 *         categoryId:
 *           type: string
 *           example: "category-123"
 *         title:
 *           type: string
 *           example: "Abuja Tech Conference 2026"
 *         description:
 *           type: string
 *           example: "A technology conference bringing developers and innovators together."
 *         venue:
 *           type: string
 *           example: "International Conference Centre"
 *         address:
 *           type: string
 *           example: "Central Business District, Abuja"
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2026-10-15T09:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2026-10-15T17:00:00.000Z"
 *         status:
 *           type: string
 *           enum:
 *             - DRAFT
 *             - PUBLISHED
 *             - CANCELLED
 *             - COMPLETED
 *           example: DRAFT
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Required fields are missing
 *       500:
 *         description: Failed to create event
 *
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of all events
 *       500:
 *         description: Failed to fetch events
 */

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event found
 *       404:
 *         description: Event not found
 *       500:
 *         description: Failed to fetch event
 *
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Failed to update event
 *
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Failed to delete event
 */


// CREATE EVENT
router.post("/", async (req, res) => {
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
      status,
    } = req.body;

    if (
      !organizerId ||
      !categoryId ||
      !title ||
      !description ||
      !venue ||
      !address ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All required event fields must be provided.",
      });
    }

    const event = await prisma.event.create({
      data: {
        organizerId,
        categoryId,
        title,
        description,
        venue,
        address,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ...(status && { status }),
      },
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create event.",
      error: error.message,
    });
  }
});

// GET ALL EVENTS
router.get("/", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get events error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch events.",
      error: error.message,
    });
  }
});

// GET SINGLE EVENT
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: {
        id,
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Get event error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event.",
      error: error.message,
    });
  }
});

// UPDATE EVENT
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      organizerId,
      categoryId,
      title,
      description,
      venue,
      address,
      startDate,
      endDate,
      status,
    } = req.body;

    const event = await prisma.event.update({
      where: {
        id,
      },
      data: {
        ...(organizerId && { organizerId }),
        ...(categoryId && { categoryId }),
        ...(title && { title }),
        ...(description && { description }),
        ...(venue && { venue }),
        ...(address && { address }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
      },
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      data: event,
    });
  } catch (error) {
    console.error("Update event error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update event.",
      error: error.message,
    });
  }
});

// DELETE EVENT
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.event.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete event.",
      error: error.message,
    });
  }
});

export default router;