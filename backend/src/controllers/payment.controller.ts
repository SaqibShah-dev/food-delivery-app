import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { paymentService } from '../services/payment.service.js';
import Order from '../models/Order.model.js';
import mongoose from 'mongoose';
import FoodItem from '../models/FoodItem.model.js';

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

export const handleWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string | undefined;

    const event = await paymentService.constructWebhookEvent(
      req.body as Buffer,
      signature
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      const userId = session.metadata.userId;
      const itemsMeta = JSON.parse(session.metadata.items);
      const address = JSON.parse(session.metadata.address);
      const totalAmount = parseFloat(session.metadata.totalAmount);
      const paymentId = session.id; // Stripe session ID

      // Validate user exists (optional but recommended)
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Build order items with food ObjectId and subtotal
      const orderItems = await Promise.all(
        itemsMeta.map(async (item: any) => {
          const food = await FoodItem.findById(item.foodId);
          if (!food) {
            const err: any = new Error(`Food item ${item.foodId} not found`);
            err.status = 400;
            throw err;
          }

          const subtotal = Number((item.unitPrice * item.quantity).toFixed(2));

          return {
            food: new mongoose.Types.ObjectId(item.foodId),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal,
          };
        })
      );

      await Order.create({
        user: userObjectId,
        items: orderItems,
        totalAmount,
        address,
        status: 'pending',
        paymentStatus: 'paid',
        paymentId,
      });
    }

    // Always acknowledge receipt to Stripe
    res.json(
      apiResponse(
        { eventId: event.id, type: event.type },
        'Webhook received'
      )
    );
  }
);