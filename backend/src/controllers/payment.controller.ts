import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { paymentService } from '../services/payment.service.js';

type CheckoutRequestBody = {
  items: {
    foodId: string;
    quantity: number;
  }[];
  address: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    country: string;
  };
};

export const createCheckoutSession = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { items, address } = req.body as CheckoutRequestBody;

    if (!address) {
      const err: any = new Error('Delivery address is required');
      err.status = 400;
      throw err;
    }

    const requiredAddressFields = [
      'fullName',
      'phone',
      'street',
      'city',
      'country',
    ] as const;

    for (const field of requiredAddressFields) {
      if (!address[field] || !address[field].trim()) {
        const err: any = new Error(`Address field "${field}" is required`);
        err.status = 400;
        throw err;
      }
    }

    const result = await paymentService.createCheckoutSession(
      req.user!.id,
      items,
      address
    );

    res.status(201).json(
      apiResponse(result, 'Stripe Checkout session created', 201)
    );
  }
);