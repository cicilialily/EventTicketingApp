import express from "express";

const router = express.Router();

// POST /api/events — create an event
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
    } = req.body;

    // TODO: replace with Prisma create once the Events module
    // is fully connected to the database.
    return res.status(201).json({
      success: true,
      message: "Event created (placeholder)",
      data: req.body,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create event",
      data: null,
    });
  }
});

// GET /api/events — list all events
router.get("/", async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "All events (placeholder)",
    data: [],
  });
});

// GET /api/events/:id — one event
router.get("/:id", async (req, res) => {
  return res.status(200).json({
    success: true,
    message: `Event ${req.params.id} (placeholder)`,
    data: null,
  });
});

// PUT /api/events/:id — update
router.put("/:id", async (req, res) => {
  return res.status(200).json({
    success: true,
    message: `Event ${req.params.id} updated (placeholder)`,
    data: null,
  });
});

// DELETE /api/events/:id — cancel/delete
router.delete("/:id", async (req, res) => {
  return res.status(200).json({
    success: true,
    message: `Event ${req.params.id} deleted (placeholder)`,
    data: null,
  });
});

export default router;
