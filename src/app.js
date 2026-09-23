const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

// Middleware
app.use(express.json());
console.log("Swagger loaded:", !!swaggerSpec);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

app.use("/api/events", require("./routes/events"));

module.exports = app;
