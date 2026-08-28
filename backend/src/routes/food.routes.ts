import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { getAll, create, update, remove } from '../controllers/food.controller.js';

const router = express.Router();

router.get('/', getAll);
router.post('/', protect, adminOnly, upload.single('image'), create);
router.put('/:id', protect, adminOnly, upload.single('image'), update);
router.delete('/:id', protect, adminOnly, remove);

export default router;