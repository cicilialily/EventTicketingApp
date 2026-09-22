const express = require("express");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventTicketing API is running",
    data: { status: "OK" },
  });
});

app.use("/api/events", require("./routes/events"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/ticket-types", require("./routes/ticketTypes"));
app.use("/api/tickets", require("./routes/tickets"));
app.use("/api/users", require("./routes/users"));

app.use(errorHandler);

module.exports = app;
