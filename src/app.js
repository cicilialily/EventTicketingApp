import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/orders.js";
import swaggerSpec from "./config/swagger.js";
import eventsRoutes from "./routes/events.js";
import ticketsRoutes from "./routes/tickets.js";
import analyticsRoutes from "./routes/analytics.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventTicketing API is running",
    data: {
      status: "OK",
    },
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/analytics", analyticsRoutes);
export default app;
