import { z } from 'zod';

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const orderStatusValues = [
  'pending',
  'confirmed',
  'preparing',
  'out-for-delivery',
  'delivered',
  'cancelled',
] as const;

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        foodId: z
          .string()
          .trim()
          .regex(objectIdRegex, 'foodId must be a valid MongoDB ObjectId'),

        quantity: z.coerce
          .number({
            error: 'Quantity must be a number',
          })
          .int('Quantity must be a whole number')
          .min(1, 'Quantity must be at least 1')
          .max(99, 'Quantity cannot exceed 99'),
      })
    )
    .min(1, 'Your cart must contain at least one item')
    .max(50, 'An order cannot contain more than 50 different food items'),

  address: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must contain at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),

    phone: z
      .string()
      .trim()
      .min(7, 'Phone number must contain at least 7 characters')
      .max(20, 'Phone number cannot exceed 20 characters'),

    street: z
      .string()
      .trim()
      .min(5, 'Street address must contain at least 5 characters')
      .max(200, 'Street address cannot exceed 200 characters'),

    city: z
      .string()
      .trim()
      .min(2, 'City must contain at least 2 characters')
      .max(100, 'City cannot exceed 100 characters'),

    country: z
      .string()
      .trim()
      .min(2, 'Country must contain at least 2 characters')
      .max(100, 'Country cannot exceed 100 characters'),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusValues, {
    error: `Status must be one of: ${orderStatusValues.join(', ')}`,
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>;