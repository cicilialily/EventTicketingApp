import { Router } from "express";

import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new user account. New accounts are assigned the USER role by default.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RegisterRequest"
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: An account with this email already exists
 *       500:
 *         description: Server error
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticates a user and returns a JWT access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginRequest"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout authenticated user
 *     description: Revokes the current JWT access token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Authentication required or token is invalid
 *       500:
 *         description: Server error
 */
router.post("/logout", authenticate, logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request a password reset
 *     description: Starts the password reset process without revealing whether the email exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: cicilia@example.com
 *     responses:
 *       200:
 *         description: Password reset request processed
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset user password
 *     description: Resets a user's password using a valid single-use reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ResetPasswordRequest"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token, or validation failure
 *       500:
 *         description: Server error
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get authenticated user information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user retrieved successfully
 *       401:
 *         description: Authentication required or token is invalid or expired
 */
router.get("/me", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authenticated user retrieved successfully",
    data: {
      user: req.user,
    },
  });
});

export default router;
