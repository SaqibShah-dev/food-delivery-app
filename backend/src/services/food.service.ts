import FoodItem from '../models/FoodItem.model.js';
import { IFoodItem } from '../types/index.js';

export const foodService = {
  // Public list: customers can see available foods only
  async getAllAvailable() {
    return FoodItem.find({ isAvailable: true }).sort({ createdAt: -1 });
  },

  // Admin list: admin can see every food item, including unavailable foods
  async getAllForAdmin() {
    return FoodItem.find().sort({ createdAt: -1 });
  },

  // Create a new food item
  async create(data: Omit<IFoodItem, '_id' | 'createdAt' | 'updatedAt'>) {
    return FoodItem.create(data);
  },

  // Update an existing food item
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

  // Temporary hard delete; we will replace this with soft delete next
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