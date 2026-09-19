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
  softDelete,
  restore,
} from '../controllers/food.controller.js';

const router = express.Router();
router.get('/', getAll);

router.get('/admin/all', protect, adminOnly, getAllForAdmin);

router.post(
  '/',
  protect,
  adminOnly,
  upload.single('image'),
  requireFile,
  validateBody(createFoodSchema),
  create
);

router.patch('/:id/restore', protect, adminOnly, restore);

router.patch(
  '/:id',
  protect,
  adminOnly,
  upload.single('image'),
  validateBody(updateFoodSchema),
  update
);

router.delete('/:id', protect, adminOnly, softDelete);


export default router;