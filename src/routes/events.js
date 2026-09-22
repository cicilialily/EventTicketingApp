const express = require("express");
const router = express.Router();

// POST /api/events — create an event
router.post("/", async (req, res) => {
    try {
        const { organizerId, categoryId, title, description, venue, address, startDate, endDate } = req.body;
        // TODO: replace with Prisma create once client is confirmed working
        res.status(201).json({ message: "Event created (placeholder)", data: req.body });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/events — list all events
router.get("/", async (req, res) => {
    res.json({ message: "All events (placeholder)" });
});

// GET /api/events/:id — one event
router.get("/:id", async (req, res) => {
    res.json({ message: `Event ${req.params.id} (placeholder)` });
});

// PUT /api/events/:id — update
router.put("/:id", async (req, res) => {
    res.json({ message: `Event ${req.params.id} updated (placeholder)` });
});

// DELETE /api/events/:id — cancel/delete
router.delete("/:id", async (req, res) => {
    res.json({ message: `Event ${req.params.id} deleted (placeholder)` });
});

module.exports = router;