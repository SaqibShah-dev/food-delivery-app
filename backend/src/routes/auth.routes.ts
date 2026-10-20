import express from "express";

import {
  register,
  login,
  me,
} from "../controllers/auth.controller.js";

import { validateBody } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  register
);

router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  login
);

router.get("/me", protect, me);

export default router;