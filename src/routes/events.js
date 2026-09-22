const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { organizerId, title, venue, startDate, endDate } = req.body || {};
    if (!organizerId || !title || !venue || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Organizer, title, venue, startDate, and endDate are required." });
    }

    return res.status(201).json({
      success: true,
      data: { id: "event_generated", organizerId, title, venue, startDate, endDate },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/", async (req, res) => {
  return res.json({ success: true, data: [] });
});

router.get("/:id", async (req, res) => {
  return res.json({ success: true, data: { id: req.params.id, title: "Sample event" } });
});

router.put("/:id", async (req, res) => {
  return res.json({ success: true, data: { id: req.params.id, ...req.body } });
});

router.delete("/:id", async (req, res) => {
  return res.json({ success: true, message: `Event ${req.params.id} deleted.` });
});

module.exports = router;