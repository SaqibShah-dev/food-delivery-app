import express from 'express';
import {
  protect,
  adminOnly,
} from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { requireFile } from '../middleware/requireFile.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  createFoodSchema,
  updateFoodSchema,
} from '../validators/food.validator.js';
import {
  getAll,
  create,
  update,
  remove,
} from '../controllers/food.controller.js';

const router = express.Router();

// Public route: customers can view available food
router.get('/', getAll);

// Admin routes
router.post(
  '/',
  protect,
  adminOnly,
  upload.single('image'),
  requireFile,
  validateBody(createFoodSchema),
  create
);

router.patch(
  '/:id',
  protect,
  adminOnly,
  upload.single('image'),
  validateBody(updateFoodSchema),
  update
);

router.delete('/:id', protect, adminOnly, remove);

export default router;