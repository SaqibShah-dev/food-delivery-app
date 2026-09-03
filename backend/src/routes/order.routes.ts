import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  create,
  getMyOrders,
} from '../controllers/order.controller.js';

const router = express.Router();

router.post('/', protect, create);
router.get('/my', protect, getMyOrders);

export default router;