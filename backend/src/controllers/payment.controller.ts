import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { paymentService } from '../services/payment.service.js';
import { orderService } from '../services/order.service.js';
import Stripe from 'stripe';

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

export const confirmCheckoutSession = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { sessionId } = req.body as { sessionId?: string };

    if (
      typeof sessionId !== 'string' ||
      !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)
    ) {
      const err: any = new Error('A valid Stripe sessionId is required');
      err.status = 400;
      throw err;
    }

    const { orderId, session } =
      await paymentService.retrievePaidCheckoutSession(
        req.user!.id,
        sessionId
      );

    await orderService.markOrderAsPaid(
      orderId,
      req.user!.id,
      session.id,
      session.amount_total,
      session.currency
    );

    res.json(
      apiResponse(
        { orderId, paymentStatus: 'paid' },
        'Payment confirmed'
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

    console.info(
      `[Stripe] Received event ${event.type} (${event.id})`
    );

    if (
      event.type === 'checkout.session.completed'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (!orderId || !userId) {
        const err: any = new Error(
          `Stripe checkout session ${session.id} is missing order metadata`
        );
        err.status = 400;
        throw err;
      }

      if (session.payment_status === 'paid') {
        await orderService.markOrderAsPaid(
          orderId,
          userId,
          session.id,
          session.amount_total,
          session.currency
        );
        console.info(
          `[Stripe] Marked order ${orderId} as paid`
        );
      } else {
        console.info(
          `[Stripe] Checkout session ${session.id} is not paid`
        );
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