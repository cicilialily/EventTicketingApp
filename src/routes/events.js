const express = require("express");
const router = express.Router();

// POST /api/events — create an event
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
 *             type: object
 *             required:
 *               - organizerId
 *               - categoryId
 *               - title
 *               - startDate
 *               - endDate
 *             properties:
 *               organizerId:
 *                 type: integer
 *                 example: 1
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: Tech Conference 2026
 *               description:
 *                 type: string
 *                 example: A conference for technology enthusiasts
 *               venue:
 *                 type: string
 *                 example: Abuja International Conference Centre
 *               address:
 *                 type: string
 *                 example: Central Business District, Abuja
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-10-15T10:00:00Z
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-10-15T17:00:00Z
 *     responses:
 *       201:
 *         description: Event created successfully
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Successfully retrieved all events
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
    res.json({ message: "All events (placeholder)" });
});

// GET /api/events/:id — get a single event by ID
/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the event
 *     responses:
 *       200:
 *         description: Successfully retrieved the event
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
    res.json({ message: `Event ${req.params.id} (placeholder)` });
});

// PUT /api/events/:id — update
/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Tech Conference 2026
 *               description:
 *                 type: string
 *                 example: Updated event description
 *               venue:
 *                 type: string
 *                 example: Abuja International Conference Centre
 *               address:
 *                 type: string
 *                 example: Central Business District, Abuja
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-10-15T10:00:00Z
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-10-15T17:00:00Z
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
    res.json({ message: `Event ${req.params.id} updated (placeholder)` });
});

// DELETE /api/events/:id — cancel/delete
/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Cancel or delete an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the event
 *     responses:
 *       200:
 *         description: Event canceled/deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
    res.json({ message: `Event ${req.params.id} deleted (placeholder)` });
});

module.exports = router;