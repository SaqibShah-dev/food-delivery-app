import FoodItem from '../models/FoodItem.model.js';
import { IFoodItem } from '../types/index.js';

export const foodService = {
  async getAllAvailable() {
    return FoodItem.find({ isAvailable: true }).sort({ createdAt: -1 });
  },

  async getAllForAdmin() {
    return FoodItem.find().sort({ createdAt: -1 });
  },

  async create(data: Omit<IFoodItem, '_id' | 'createdAt' | 'updatedAt'>) {
    return FoodItem.create(data);
  },

  async updateById(id: string, data: Partial<IFoodItem>) {
    const updated = await FoodItem.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      const err: any = new Error('Food item not found');
      err.status = 404;
      throw err;
    }

    return updated;
  },

  async softDeleteById(id: string) {
    const item = await FoodItem.findByIdAndUpdate(
      id,
      { isAvailable: false },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      const err: any = new Error('Food item not found');
      err.status = 404;
      throw err;
    }

    return item;
  },

  async restoreById(id: string) {
    const item = await FoodItem.findByIdAndUpdate(
      id,
      { isAvailable: true },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      const err: any = new Error('Food item not found');
      err.status = 404;
      throw err;
    }

    return item;
  },
};