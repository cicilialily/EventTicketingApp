import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { listMyTickets } from "../controllers/myTickets.controller.js";

const router = express.Router();

router.get("/my-tickets", authenticate, listMyTickets);

export default router;
