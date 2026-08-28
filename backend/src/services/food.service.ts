import FoodItem from '../models/FoodItem.model.js';
import { IFoodItem } from '../types/index.js';

export const foodService = {
  async getAllAvailable() {
    return FoodItem.find({ isAvailable: true });
  },

  async create(data: Omit<IFoodItem, '_id' | 'createdAt' | 'updatedAt'>) {
    return FoodItem.create(data);
  },

  async updateById(id: string, data: Partial<IFoodItem>) {
    const updated = await FoodItem.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
      const err: any = new Error('Food item not found');
      err.status = 404;
      throw err;
    }
    return updated;
  },

  async deleteById(id: string) {
    const deleted = await FoodItem.findByIdAndDelete(id);
    if (!deleted) {
      const err: any = new Error('Food item not found');
      err.status = 404;
      throw err;
    }
    return deleted;
  },
};