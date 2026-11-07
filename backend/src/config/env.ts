import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const positiveIntegerString = (fallback: string) =>
  z
    .string()
    .regex(/^\d+$/, 'Must be a positive integer')
    .refine((value) => Number(value) > 0, 'Must be greater than zero')
    .default(fallback);

const envSchema = z.object({
  PORT: z
    .string()
    .regex(/^\d+$/, 'Must be a port number')
    .refine(
      (value) => Number(value) > 0 && Number(value) <= 65535,
      'Must be between 1 and 65535',
    )
    .default('5000'),
  NODE_ENV: z.string().trim().min(1).default('development'),

  MONGO_URI: z
    .string()
    .trim()
    .regex(/^mongodb(\+srv)?:\/\//, 'Must be a valid MongoDB connection URI'),
  JWT_SECRET: z.string().min(32, 'Must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().trim().min(1).default('7d'),

  CLIENT_URL: z.string().url(),

  API_RATE_LIMIT_WINDOW_MS: positiveIntegerString('900000'),
  API_RATE_LIMIT_MAX: positiveIntegerString('200'),

  AUTH_RATE_LIMIT_WINDOW_MS: positiveIntegerString('900000'),
  AUTH_RATE_LIMIT_MAX: positiveIntegerString('20'),

  STRIPE_SECRET_KEY: z
    .string()
    .trim()
    .regex(/^sk_(test|live)_/, 'Must be a Stripe secret key'),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .trim()
    .regex(/^whsec_/, 'Must be a Stripe webhook signing secret'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;