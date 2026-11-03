import express from 'express';
import { createCheckoutSession } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post(
  '/create-checkout-session',
  protect,
  createCheckoutSession
);

export default router;