import express from "express";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { listMyTickets } from "../controllers/myTickets.controller.js";
import { getTicketQr } from "../controllers/ticketController.js";
import { checkInTicket } from "../controllers/checkIn.controller.js";

const router = express.Router();

// Attendee: get the currently logged-in user's tickets
router.get("/my-tickets", authenticate, listMyTickets);

// Attendee: get a ticket's QR code
router.get("/:id/qr", authenticate, getTicketQr);

// Organizer/Admin: check in an attendee using their QR payload
router.post(
  "/check-in",
  authenticate,
  authorizeRoles("ORGANIZER", "ADMIN"),
  checkInTicket,
);

export default router;
