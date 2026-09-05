import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createCheckoutSession } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);

export default router;