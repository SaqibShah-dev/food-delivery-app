import { Types } from 'mongoose';
import FoodItem from '../models/FoodItem.model.js';
import Order from '../models/Order.model.js';
import { IAddress, IOrderItem } from '../types/index.js';

type RequestedOrderItem = {
  foodId: string;
  quantity: number;
};

export const orderService = {
  async createOrder(
    userId: string,
    requestedItems: RequestedOrderItem[],
    address: IAddress
  ) {
    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
      const err: any = new Error('Your cart must contain at least one item');
      err.status = 400;
      throw err;
    }

    const foodIds = requestedItems.map((item) => item.foodId);

    if (
      foodIds.some(
        (foodId) =>
          typeof foodId !== 'string' || !Types.ObjectId.isValid(foodId)
      )
    ) {
      const err: any = new Error('Every foodId must be a valid food item ID');
      err.status = 400;
      throw err;
    }

    const foodItems = await FoodItem.find({
      _id: { $in: foodIds },
      isAvailable: true,
    });

    if (foodItems.length !== foodIds.length) {
      const err: any = new Error(
        'One or more food items do not exist or are unavailable'
      );
      err.status = 400;
      throw err;
    }

    const foodById = new Map(
      foodItems.map((food) => [food._id.toString(), food])
    );

    const items: IOrderItem[] = requestedItems.map((requestedItem) => {
      const quantity = Number(requestedItem.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        const err: any = new Error(
          'Every item quantity must be a whole number greater than 0'
        );
        err.status = 400;
        throw err;
      }

      const food = foodById.get(requestedItem.foodId);

      if (!food) {
        const err: any = new Error('Food item was not found');
        err.status = 400;
        throw err;
      }

      const unitPrice = food.price;
      const subtotal = Number((unitPrice * quantity).toFixed(2));

      return {
        food: food._id.toString(),
        quantity,
        unitPrice,
        subtotal,
      };
    });

    const totalAmount = Number(
      items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
    );

    return Order.create({
      user: userId,
      items,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      address,
    });
  },

  async getOrdersForUser(userId: string) {
    return Order.find({ user: userId })
      .populate('items.food', 'name image category')
      .sort({ createdAt: -1 });
  },
};