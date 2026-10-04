import express from "express";

import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";

import { listMyTickets } from "../controllers/myTickets.controller.js";

import { getTicketQr } from "../controllers/ticketController.js";

import { checkInTicket } from "../controllers/checkIn.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Tickets
 *     description: User ticket retrieval and QR codes
 *   - name: Validation
 *     description: Ticket validation and attendee check-in
 *
 * components:
 *   schemas:
 *
 *     Ticket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         ticketNumber:
 *           type: string
 *           example: "TKT-20261003-0001"
 *         qrCode:
 *           type: string
 *         status:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - USED
 *             - CANCELLED
 *         checkedInAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     TicketEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         venue:
 *           type: string
 *         address:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *
 *     TicketTypeSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         price:
 *           type: number
 *           format: double
 *
 *     MyTicket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         ticketNumber:
 *           type: string
 *         qrCode:
 *           type: string
 *         status:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - USED
 *             - CANCELLED
 *         checkedInAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         event:
 *           $ref: '#/components/schemas/TicketEvent'
 *         ticketType:
 *           $ref: '#/components/schemas/TicketTypeSummary'
 *
 *     CheckInRequest:
 *       type: object
 *       required:
 *         - ticketNumber
 *       properties:
 *         ticketNumber:
 *           type: string
 *           description: Ticket number obtained from the attendee ticket or QR code
 *           example: "TKT-20261003-0001"
 *
 *     TicketSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Tickets retrieved successfully
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MyTicket'
 *
 *     CheckInResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Ticket validated successfully
 *         data:
 *           type: object
 *           properties:
 *             ticket:
 *               $ref: '#/components/schemas/MyTicket'
 *
 *     TicketErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Ticket not found
 */

/**
 * @swagger
 * /api/tickets/my-tickets:
 *   get:
 *     summary: Get my tickets
 *     description: Returns all tickets belonging to the authenticated user.
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketSuccessResponse'
 *
 *       401:
 *         description: Authentication required
 */
router.get("/my-tickets", authenticate, listMyTickets);

/**
 * @swagger
 * /api/tickets/{id}/qr:
 *   get:
 *     summary: Get ticket QR code
 *     description: Returns the QR code associated with a specific ticket.
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Ticket ID
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: QR code retrieved successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Ticket not found
 */
router.get("/:id/qr", authenticate, getTicketQr);

/**
 * @swagger
 * /api/tickets/check-in:
 *   post:
 *     summary: Validate and check in a ticket
 *     description: Validates a ticket and marks it as used when an authorized organizer or administrator checks in an attendee.
 *     tags:
 *       - Validation
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckInRequest'
 *
 *     responses:
 *       200:
 *         description: Ticket validated and checked in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckInResponse'
 *
 *       400:
 *         description: Invalid ticket or ticket has already been used
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Organizer or admin access required
 *
 *       404:
 *         description: Ticket not found
 */
router.post(
  "/check-in",
  authenticate,
  authorizeRoles("ORGANIZER", "ADMIN"),
  checkInTicket,
);

export default router;
