import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

import {
  createNewCategory,
  createNewEvent,
  deleteEvent,
  getEvent,
  listCategories,
  listEvents,
  listManagedEvents,
  updateExistingEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event discovery and event management
 *
 * components:
 *   schemas:
 *
 *     EventImage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         imageUrl:
 *           type: string
 *           format: uri
 *         isPrimary:
 *           type: boolean
 *
 *     TicketType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         price:
 *           type: number
 *           format: double
 *         quantity:
 *           type: integer
 *         quantitySold:
 *           type: integer
 *         saleStart:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         saleEnd:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         organizerId:
 *           type: string
 *           format: uuid
 *         categoryId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
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
 *         status:
 *           type: string
 *           enum:
 *             - DRAFT
 *             - PUBLISHED
 *             - CANCELLED
 *             - COMPLETED
 *         category:
 *           type: object
 *         organizer:
 *           type: object
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EventImage'
 *         ticketTypes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TicketType'
 *
 *     EventCreate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - categoryId
 *         - venue
 *         - address
 *         - startDate
 *         - endDate
 *       properties:
 *         title:
 *           type: string
 *           example: Tech Conference 2026
 *         description:
 *           type: string
 *           example: A technology conference for students and developers.
 *         categoryId:
 *           type: string
 *           format: uuid
 *           example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         venue:
 *           type: string
 *           example: Landmark Centre
 *         address:
 *           type: string
 *           example: Victoria Island, Lagos
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: 2026-11-20T10:00:00Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: 2026-11-20T17:00:00Z
 *         status:
 *           type: string
 *           enum:
 *             - DRAFT
 *             - PUBLISHED
 *           default: DRAFT
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/event-image.jpg
 *               isPrimary:
 *                 type: boolean
 *                 default: false
 *         ticketTypes:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Regular
 *               description:
 *                 type: string
 *                 example: Standard event access
 *               price:
 *                 type: number
 *                 example: 5000
 *               quantity:
 *                 type: integer
 *                 example: 100
 *               saleStart:
 *                 type: string
 *                 format: date-time
 *               saleEnd:
 *                 type: string
 *                 format: date-time
 *
 *     EventUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         categoryId:
 *           type: string
 *           format: uuid
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
 *         status:
 *           type: string
 *           enum:
 *             - DRAFT
 *             - PUBLISHED
 *             - CANCELLED
 *             - COMPLETED
 *
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *
 *     CategoryCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Technology
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get published events
 *     description: Returns all publicly visible published events.
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by event title, description, venue or address
 *
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter events by category
 *
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 */
router.get("/", listEvents);

/**
 * @swagger
 * /api/events/categories:
 *   get:
 *     summary: Get event categories
 *     description: Returns all available event categories.
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Event categories retrieved successfully
 */
router.get("/categories", listCategories);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a published event
 *     description: Returns one publicly visible published event.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *       404:
 *         description: Event not found
 */

router.get(
  "/my-events",
  authenticate,
  authorizeRoles("ORGANIZER", "ADMIN"),
  listManagedEvents,
);
router.get("/:id", getEvent);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create an event
 *     description: Creates an event for the authenticated organizer. The organizer ID comes from the authenticated user.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreate'
 *
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid event data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Organizer or admin access required
 */
router.post(
  "/",
  authenticate,
  authorizeRoles("ORGANIZER", "ADMIN"),
  createNewEvent,
);

/**
 * @swagger
 * /api/events/categories:
 *   post:
 *     summary: Create an event category
 *     description: Creates a new event category.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *
 *     responses:
 *       201:
 *         description: Event category created successfully
 *       400:
 *         description: Invalid category data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Organizer or admin access required
 *       409:
 *         description: Event category already exists
 */
router.post(
  "/categories",
  authenticate,
  authorizeRoles("ORGANIZER", "ADMIN"),
  createNewCategory,
);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update an event
 *     description: Updates an event owned by the authenticated organizer. Admins can update any event.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventUpdate'
 *
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Invalid event data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You do not have permission to manage this event
 *       404:
 *         description: Event not found
 */
router.put(
  "/:id",
  authenticate,
  authorizeRoles("ORGANIZER", "ADMIN"),
  updateExistingEvent,
);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Cancel an event
 *     description: Cancels an event by changing its status to CANCELLED instead of permanently deleting it.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Event cancelled successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You do not have permission to manage this event
 *       404:
 *         description: Event not found
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ORGANIZER", "ADMIN"),
  deleteEvent,
);

export default router;
