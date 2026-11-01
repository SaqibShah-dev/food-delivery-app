import express from 'express';
import { createCheckoutSession, handleWebhook } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected: create Stripe Checkout session
router.post('/create-checkout-session', protect, createCheckoutSession);


export default router;