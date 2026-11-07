import Stripe from 'stripe';
import Order from '../models/Order.model.js';
import { env } from '../config/env.js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const paymentService = {
  async createCheckoutSession(userId: string, orderId: string) {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate('items.food', 'name');

    if (!order) {
      const err: any = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    if (order.paymentMethod !== 'stripe') {
      const err: any = new Error(
        'This order uses cash on delivery and cannot be paid through Stripe'
      );
      err.status = 409;
      throw err;
    }

    if (order.paymentStatus === 'paid') {
      const err: any = new Error(
        'This order has already been paid'
      );
      err.status = 400;
      throw err;
    }

    if (order.status === 'cancelled') {
      const err: any = new Error(
        'Cancelled orders cannot be paid'
      );
      err.status = 400;
      throw err;
    }

    if (order.checkoutSessionId) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        order.checkoutSessionId
      );

      if (existingSession.status === 'open' && existingSession.url) {
        return {
          checkoutUrl: existingSession.url,
          sessionId: existingSession.id,
        };
      }

      if (existingSession.status === 'complete') {
        const err: any = new Error(
          'This Checkout Session has already completed. Wait for payment confirmation or check your orders.'
        );
        err.status = 409;
        throw err;
      }
    }

    const lineItems = order.items.map((item) => {
      const food = item.food as { name?: string };
      const foodName = item.foodName || food?.name;
      const unitAmount = Math.round(item.unitPrice * 100);

      if (
        !foodName ||
        !Number.isSafeInteger(unitAmount) ||
        unitAmount <= 0
      ) {
        const err: any = new Error(
          'Order contains invalid food data'
        );
        err.status = 400;
        throw err;
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: foodName,
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const checkoutTotal = lineItems.reduce(
      (total, item) => total + item.price_data.unit_amount * item.quantity,
      0
    );

    if (checkoutTotal !== Math.round(order.totalAmount * 100)) {
      const err: any = new Error(
        'Order items do not match the saved order total'
      );
      err.status = 409;
      throw err;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${env.CLIENT_URL}/payment/success?order_id=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/payment/cancel?order_id=${order._id}`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    if (!session.url) {
      const err: any = new Error(
        'Stripe did not return a checkout URL'
      );
      err.status = 500;
      throw err;
    }

    order.checkoutSessionId = session.id;
    await order.save();

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  },

  async retrievePaidCheckoutSession(userId: string, sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId;

    if (!orderId || session.metadata?.userId !== userId) {
      const err: any = new Error(
        'Checkout session does not belong to this user'
      );
      err.status = 404;
      throw err;
    }

    if (session.payment_status !== 'paid') {
      const err: any = new Error(
        'Stripe has not confirmed payment for this checkout session'
      );
      err.status = 409;
      throw err;
    }

    return { orderId, session };
  },

  async constructWebhookEvent(
    body: Buffer,
    signature: string | undefined
  ): Promise<Stripe.Event> {
    if (!signature) {
      const err: any = new Error(
        'Missing Stripe signature'
      );
      err.status = 400;
      throw err;
    }

    return stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  },
};