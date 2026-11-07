import express from 'express';
import {
  confirmCheckoutSession,
  createCheckoutSession,
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post(
  '/create-checkout-session',
  protect,
  createCheckoutSession
);

router.post(
  '/confirm-checkout-session',
  protect,
  confirmCheckoutSession
);

export default router;