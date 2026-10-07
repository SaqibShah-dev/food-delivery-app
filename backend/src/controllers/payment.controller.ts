import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { paymentService } from '../services/payment.service.js';
import Order from '../models/Order.model.js';
import mongoose from 'mongoose';
import FoodItem from '../models/FoodItem.model.js';
import { orderService } from '../services/order.service.js';

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
      const totalAmount = parseFloat(session.metadata.totalAmount);
      const paymentId = session.id;

      const foodIds = itemsMeta.map((item: any) => item.foodId);

      // Find the matching pending order
      const order = await orderService.findByPaymentMetadata(
        userId,
        totalAmount,
        foodIds
      );

      if (!order) {
        // Log warning but still acknowledge webhook
        console.warn(
          `No matching pending order found for user ${userId}, amount ${totalAmount}`
        );
      } else {
        // Mark order as paid
        await orderService.markOrderAsPaid(order._id.toString(), paymentId);
      }
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