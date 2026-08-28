import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { foodService } from '../services/food.service.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { IFoodItem } from '../types/index.js';

export const getAll = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const items = await foodService.getAllAvailable();
  res.json(apiResponse(items));
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, price, category } = (req.body ?? {}) as {
    name: string;
    description: string;
    price: number;
    category: string;
  };

  if (!name || !description || price === undefined || !category) {
    const err: any = new Error(
      'name, description, price, and category are required'
    );
    err.status = 400;
    throw err;
  }

  const image = req.file ? `/uploads/${req.file.filename}` : '';

  const item = await foodService.create({
    name,
    description,
    price,
    category,
    image,
    isAvailable: true,
  });

  res.status(201).json(apiResponse(item, 'Food item created'));
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    const err: any = new Error('Invalid food item id');
    err.status = 400;
    throw err;
  }
  const { name, description, price, category, isAvailable } = req.body as Partial<IFoodItem>;

  const updateData: Partial<IFoodItem> = {
    name,
    description,
    price,
    category,
    isAvailable,
  };

  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }

  const item = await foodService.updateById(id, updateData);
  res.json(apiResponse(item, 'Food item updated'));
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    const err: any = new Error('Invalid food item id');
    err.status = 400;
    throw err;
  }
  await foodService.deleteById(id);
  res.json(apiResponse(null, 'Food item deleted'));
});