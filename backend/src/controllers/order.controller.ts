import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { orderService } from '../services/order.service.js';
import {
  CreateOrderInput,
  UpdateOrderStatusInput,
} from '../validators/order.validator.js';

export const create = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { items, address } = req.body as CreateOrderInput;

    const order = await orderService.createOrder(
      req.user!.id,
      items,
      address
    );

    res.status(201).json(
      apiResponse(order, 'Order placed successfully', 201)
    );
  }
);

export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const orders = await orderService.getOrdersForUser(req.user!.id);

    res.json(apiResponse(orders, 'Your orders'));
  }
);

export const getAll = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const orders = await orderService.getAllOrders();

    res.json(apiResponse(orders, 'All orders'));
  }
);

export const updateStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (typeof id !== 'string' || !id.trim()) {
      const err: any = new Error('A valid order ID is required');
      err.status = 400;
      throw err;
    }

    const { status } = req.body as UpdateOrderStatusInput;

    const updatedOrder = await orderService.updateOrderStatus(id, status);

    res.json(apiResponse(updatedOrder, 'Order status updated'));
  }
);