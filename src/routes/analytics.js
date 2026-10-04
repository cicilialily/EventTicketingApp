import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Organizer event, ticket, sales, and attendance analytics
 *
 * components:
 *   schemas:
 *
 *     Analytics:
 *       type: object
 *       properties:
 *         totalEvents:
 *           type: integer
 *           description: Total number of events managed by the organizer
 *           example: 5
 *
 *         publishedEvents:
 *           type: integer
 *           description: Number of published events
 *           example: 3
 *
 *         draftEvents:
 *           type: integer
 *           description: Number of events still in draft status
 *           example: 1
 *
 *         cancelledEvents:
 *           type: integer
 *           description: Number of cancelled events
 *           example: 1
 *
 *         upcomingEvents:
 *           type: integer
 *           description: Number of upcoming events
 *           example: 2
 *
 *         paidOrders:
 *           type: integer
 *           description: Number of paid orders associated with the organizer's events
 *           example: 24
 *
 *         ticketsSold:
 *           type: integer
 *           description: Total number of tickets sold
 *           example: 68
 *
 *         checkedIn:
 *           type: integer
 *           description: Total number of attendees checked in
 *           example: 41
 *
 *         revenue:
 *           type: number
 *           format: double
 *           description: Total revenue generated from paid orders
 *           example: 238000
 *
 *     AnalyticsSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *
 *         message:
 *           type: string
 *           example: Analytics retrieved successfully
 *
 *         data:
 *           $ref: '#/components/schemas/Analytics'
 *
 *     AnalyticsErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *
 *         message:
 *           type: string
 *           example: Unable to retrieve analytics
 *
 *         data:
 *           nullable: true
 *           example: null
 */

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get organizer analytics
 *     description: Returns event, ticket sales, attendance, order, and revenue statistics for the authenticated organizer. Administrators can access analytics across events available to them.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsSuccessResponse'
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Organizer or administrator access required
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsErrorResponse'
 */
router.get(
  "/",
  authenticate,
  authorizeRoles("ORGANIZER", "ADMIN"),
  getAnalytics,
);

export default router;
