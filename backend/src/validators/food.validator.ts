import { z } from 'zod';

const priceSchema = z.coerce
  .number({
    error: 'Price must be a number',
  })
  .positive('Price must be greater than 0')
  .max(100000, 'Price is too large');

const isAvailableSchema = z.preprocess(
  (value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  },
  z.boolean({
    error: 'isAvailable must be true or false',
  })
);

export const createFoodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must contain at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),

  description: z
    .string()
    .trim()
    .min(5, 'Description must contain at least 5 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),

  price: priceSchema,

  category: z
    .string()
    .trim()
    .min(2, 'Category must contain at least 2 characters')
    .max(50, 'Category cannot exceed 50 characters'),
});

export const updateFoodSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must contain at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),

    description: z
      .string()
      .trim()
      .min(5, 'Description must contain at least 5 characters')
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),

    price: priceSchema.optional(),

    category: z
      .string()
      .trim()
      .min(2, 'Category must contain at least 2 characters')
      .max(50, 'Category cannot exceed 50 characters')
      .optional(),

    isAvailable: isAvailableSchema.optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    {
      message: 'Provide at least one field to update',
    }
  );

export type CreateFoodInput = z.infer<typeof createFoodSchema>;
export type UpdateFoodInput = z.infer<typeof updateFoodSchema>;