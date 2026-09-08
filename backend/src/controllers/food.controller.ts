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

export const create = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, description, price, category } = req.body as {
      name: string;
      description: string;
      price: number;
      category: string;
    };

    const item = await foodService.create({
      name,
      description,
      price,
      category,
      image: `/uploads/${req.file!.filename}`,
      isAvailable: true,
    });

    res.status(201).json(
      apiResponse(item, 'Food item created', 201)
    );
  }
);

export const update = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (typeof id !== 'string' || !id.trim()) {
      const err: any = new Error('A valid food item ID is required');
      err.status = 400;
      throw err;
    }

    const updateData = req.body as Partial<IFoodItem>;

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const item = await foodService.updateById(id, updateData);

    res.json(apiResponse(item, 'Food item updated'));
  }
);

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