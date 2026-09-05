import express from 'express';
import {
  protect,
  adminOnly,
} from '../middleware/auth.middleware.js';
import {
  create,
  getMyOrders,
  getAll,
  updateStatus,
} from '../controllers/order.controller.js';

const router = express.Router();

// Logged-in customer routes
router.post('/', protect, create);
router.get('/my', protect, getMyOrders);

// Admin-only routes
router.get('/', protect, adminOnly, getAll);
router.patch('/:id/status', protect, adminOnly, updateStatus);

export default router;