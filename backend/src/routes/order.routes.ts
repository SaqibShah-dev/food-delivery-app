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
  getById,
  getAll,
  updateStatus,
} from '../controllers/order.controller.js';

const router = express.Router();

// Customer order creation/list
router.post('/', protect, validateBody(createOrderSchema), create);

router.get('/my', protect, getMyOrders);

// Admin list of every order
router.get('/', protect, adminOnly, getAll);

// Customer can view own order; admin can view any order
router.get('/:id', protect, getById);

// Admin changes status
router.patch(
  '/:id/status',
  protect,
  adminOnly,
  validateBody(updateOrderStatusSchema),
  updateStatus
);

export default router;