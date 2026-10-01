import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { listMyTickets } from "../controllers/myTickets.controller.js";
import { getTicketQr } from "../controllers/ticketController.js";

const router = express.Router();

router.get("/my-tickets", authenticate, listMyTickets);

router.get("/:id/qr", authenticate, getTicketQr);

export default router;
