import { Router } from "express";

import { createOrder, payOrder } from "../controllers/orderController.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order creation and order management
 *   - name: Payments
 *     description: Payment processing for orders
 *
 * components:
 *   schemas:
 *
 *     OrderItemCreate:
 *       type: object
 *       required:
 *         - ticketTypeId
 *         - quantity
 *       properties:
 *         ticketTypeId:
 *           type: string
 *           format: uuid
 *           description: ID of the ticket type being purchased
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Number of tickets to purchase
 *           example: 2
 *
 *     OrderCreateRequest:
 *       type: object
 *       required:
 *         - eventId
 *         - items
 *       properties:
 *         eventId:
 *           type: string
 *           format: uuid
 *           description: ID of the event
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/OrderItemCreate'
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         ticketTypeId:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: integer
 *         unitPrice:
 *           type: number
 *           format: double
 *         subtotal:
 *           type: number
 *           format: double
 *
 *     OrderTicket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         ticketNumber:
 *           type: string
 *         status:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - USED
 *             - CANCELLED
 *         qrCode:
 *           type: string
 *         checkedInAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         orderNumber:
 *           type: string
 *           example: "ORD-20261003-0001"
 *         userId:
 *           type: string
 *           format: uuid
 *         eventId:
 *           type: string
 *           format: uuid
 *         totalAmount:
 *           type: number
 *           format: double
 *         status:
 *           type: string
 *           enum:
 *             - PENDING
 *             - PAID
 *             - FAILED
 *             - CANCELLED
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *
 *     OrderSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Order created successfully
 *         data:
 *           $ref: '#/components/schemas/Order'
 *
 *     OrderErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Unable to process request
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create an order
 *     description: Creates an order for the authenticated user and reserves the requested tickets.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreateRequest'
 *
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderSuccessResponse'
 *
 *       400:
 *         description: Invalid order data or ticket quantity
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Event or ticket type not found
 */
router.post("/", authenticate, createOrder);

/**
 * @swagger
 * /api/orders/{id}/pay:
 *   post:
 *     summary: Pay for an order
 *     description: Processes payment for an existing pending order and generates tickets after successful payment.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the order to pay for
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Payment completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderSuccessResponse'
 *
 *       400:
 *         description: Invalid payment request or order cannot be paid
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Order not found
 *
 *       409:
 *         description: Order has already been processed
 */
router.post("/:id/pay", authenticate, payOrder);

export default router;
