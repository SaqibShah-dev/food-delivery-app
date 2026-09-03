import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { orderService } from '../services/order.service.js';
import { IAddress } from '../types/index.js';

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { items, address } = req.body as {
    items: { foodId: string; quantity: number }[];
    address: IAddress;
  };

  if (!address) {
    const err: any = new Error('Delivery address is required');
    err.status = 400;
    throw err;
  }

  const requiredAddressFields: (keyof IAddress)[] = [
    'fullName',
    'phone',
    'street',
    'city',
    'country',
  ];

  for (const field of requiredAddressFields) {
    if (!address[field] || !String(address[field]).trim()) {
      const err: any = new Error(`Address field "${field}" is required`);
      err.status = 400;
      throw err;
    }
  }

  const order = await orderService.createOrder(
    req.user!.id,
    items,
    address
  );

  res.status(201).json(apiResponse(order, 'Order placed successfully', 201));
});

export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const orders = await orderService.getOrdersForUser(req.user!.id);

    res.json(apiResponse(orders, 'Your orders'));
  }
);