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
  getAllForAdmin,
  create,
  update,
  remove,
} from '../controllers/food.controller.js';

const router = express.Router();

// Public route: customers can view available food only
router.get('/', getAll);

// Admin route: admin can view every food item,
// including unavailable food items
router.get('/admin/all', protect, adminOnly, getAllForAdmin);

// Admin route: create a food item
router.post(
  '/',
  protect,
  adminOnly,
  upload.single('image'),
  requireFile,
  validateBody(createFoodSchema),
  create
);

// Admin route: partially update a food item
router.patch(
  '/:id',
  protect,
  adminOnly,
  upload.single('image'),
  validateBody(updateFoodSchema),
  update
);

// Admin route: delete a food item
router.delete('/:id', protect, adminOnly, remove);

export default router;