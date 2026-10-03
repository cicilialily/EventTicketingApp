import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRoles("ORGANIZER", "ADMIN"),
  getAnalytics,
);

export default router;
