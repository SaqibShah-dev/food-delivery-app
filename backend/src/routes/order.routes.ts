import express from 'express';
import {
  protect,
  adminOnly,
} from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator.js';
import {
  create,
  getMyOrders,
  getAll,
  updateStatus,
} from '../controllers/order.controller.js';

const router = express.Router();

// Customer routes
router.post('/', protect, validateBody(createOrderSchema), create);

router.get('/my', protect, getMyOrders);

// Admin routes
router.get('/', protect, adminOnly, getAll);

router.patch(
  '/:id/status',
  protect,
  adminOnly,
  validateBody(updateOrderStatusSchema),
  updateStatus
);

export default router;