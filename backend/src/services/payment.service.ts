import Stripe from 'stripe';
import FoodItem from '../models/FoodItem.model.js';
import { env } from '../config/env.js';

type CheckoutItemRequest = {
  foodId: string;
  quantity: number;
};

type CheckoutAddress = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  country: string;
};

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const paymentService = {
  async createCheckoutSession(
    userId: string,
    requestedItems: CheckoutItemRequest[],
    address: CheckoutAddress
  ) {
    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
      const err: any = new Error('Your cart must contain at least one item');
      err.status = 400;
      throw err;
    }

    const foodIds = requestedItems.map((item) => item.foodId);

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

    const validatedItems = requestedItems.map((requestedItem) => {
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

      return {
        foodId: food._id.toString(),
        name: food.name,
        price: food.price,
        quantity,
      };
    });

    const totalAmount = Number(
      validatedItems
        .reduce((total, item) => total + item.price * item.quantity, 0)
        .toFixed(2)
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      payment_method_types: ['card'],

      line_items: validatedItems.map((item) => ({
        price_data: {
          currency: 'usd',

          product_data: {
            name: item.name,
          },

          unit_amount: Math.round(item.price * 100),
        },

        quantity: item.quantity,
      })),

      success_url: `${env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${env.CLIENT_URL}/cancel`,

      metadata: {
        userId,
        items: JSON.stringify(
          validatedItems.map((item) => ({
            foodId: item.foodId,
            quantity: item.quantity,
            unitPrice: item.price,
          }))
        ),
        address: JSON.stringify(address),
        totalAmount: totalAmount.toString(),
      },
    });

    if (!session.url) {
      const err: any = new Error('Stripe did not return a checkout URL');
      err.status = 500;
      throw err;
    }

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  },
};