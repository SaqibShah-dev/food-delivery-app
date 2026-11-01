import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { paymentService } from '../services/payment.service.js';
import { orderService } from '../services/order.service.js';

export const createCheckoutSession = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { orderId } = req.body as { orderId?: string };

    if (!orderId || typeof orderId !== 'string') {
      const err: any = new Error(
        'A valid orderId is required'
      );
      err.status = 400;
      throw err;
    }

    const result =
      await paymentService.createCheckoutSession(
        req.user!.id,
        orderId
      );

    res.status(201).json(
      apiResponse(
        result,
        'Stripe Checkout session created',
        201
      )
    );
  }
);

export const handleWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers[
      'stripe-signature'
    ] as string | undefined;

    const event =
      await paymentService.constructWebhookEvent(
        req.body as Buffer,
        signature
      );

    if (
      event.type === 'checkout.session.completed'
    ) {
      const session = event.data.object as {
        id: string;
        metadata?: {
          orderId?: string;
          userId?: string;
        };
      };

      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (!orderId || !userId) {
        console.warn(
          'Stripe session missing order metadata:',
          session.id
        );
      } else {
        const order =
          await orderService.getById(orderId);

        if (
          order &&
          String(order.user._id) === userId &&
          order.paymentStatus !== 'paid'
        ) {
          await orderService.markOrderAsPaid(
            orderId,
            session.id
          );
        }
      }
    }

    res.json(
      apiResponse(
        { eventId: event.id, type: event.type },
        'Webhook received'
      )
    );
  }
);