import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IOrder } from '../types/index.js';

export interface IOrderDoc
  extends Document,
    Omit<IOrder, '_id' | 'user'> {
  user: Types.ObjectId;
}

const orderItemSchema = new Schema(
  {
    food: {
      type: Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDoc>(
  {
    user:{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: 'An order must contain at least one item',
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'out-for-delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    paymentId: {
      type: String,
    },

    address: {
      type: addressSchema,
      required: true,
    },
  },
  { timestamps: true }
);

export const Order: Model<IOrderDoc> =
  mongoose.models.Order ||
  mongoose.model<IOrderDoc>('Order', orderSchema);

export default Order;