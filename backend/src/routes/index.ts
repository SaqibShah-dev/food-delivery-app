import express from 'express';
import authRoutes from './auth.routes.js';
import foodRoutes from './food.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/food', foodRoutes);
// order and payment routes will be added later

export default router;