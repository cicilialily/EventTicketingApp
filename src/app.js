import express from "express";
import authRoutes from "./routes/auth.routes.js";

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

app.use("/api/auth", authRoutes);

export default app;
