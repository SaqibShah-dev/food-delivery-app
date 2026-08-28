import express from 'express';
import authRoutes from './auth.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
// other routes will be added later

export default router;