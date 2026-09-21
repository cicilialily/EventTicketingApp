const express = require("express");

const app = express();

// Middleware
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventTicketing API is running",
    data: {
      status: "OK",
    },
  });
});

module.exports = app;
