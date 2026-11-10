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
  }),
);

export const foodMenuSortSchema = z.enum([
  'newest',
  'price-asc',
  'price-desc',
  'name-asc',
  'name-desc',
]);

export const foodMenuQuerySchema = z.object({
  page: z.coerce
    .number({
      error: 'Page must be a number',
    })
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),

  limit: z.coerce
    .number({
      error: 'Limit must be a number',
    })
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .default(9),

  category: z
    .string()
    .trim()
    .max(50, 'Category cannot exceed 50 characters')
    .optional(),

  search: z
    .string()
    .trim()
    .max(100, 'Search cannot exceed 100 characters')
    .optional(),

  sort: foodMenuSortSchema.optional(),
});

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
    },
  );

export type FoodMenuQueryInput = z.infer<typeof foodMenuQuerySchema>;
export type CreateFoodInput = z.infer<typeof createFoodSchema>;
export type UpdateFoodInput = z.infer<typeof updateFoodSchema>;