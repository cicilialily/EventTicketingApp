import express from "express";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import swaggerSpec from "./config/swagger.js";
import eventsRoutes from "./routes/events.js";

import orderRoutes from './routes/orders.js';
import ticketRoutes from './routes/tickets.js';
import ticketTypeRoutes from './routes/ticketTypes.js';
import users from './routes/users.js';

const app = express();

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

app.use('/api/orders', orderRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/ticket-types', ticketTypeRoutes);
app.use('/api/users', users);


export default app;
