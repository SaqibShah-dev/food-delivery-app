import Stripe from 'stripe';
import Order from '../models/Order.model.js';
import { env } from '../config/env.js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const paymentService = {
  async createCheckoutSession(userId: string, orderId: string) {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate('items.food', 'name price image');

    if (!order) {
      const err: any = new Error('Order not found');
      err.status = 404;
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

    const lineItems = order.items.map((item) => {
      const food = item.food as {
        name?: string;
        price?: number;
      };

      if (!food?.name || typeof food.price !== 'number') {
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
            name: food.name,
          },
          unit_amount: Math.round(food.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${env.CLIENT_URL}/payment/success?order_id=${order._id}`,
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

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
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