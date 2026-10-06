import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.string().default('development'),

  MONGO_URI: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CLIENT_URL: z.string(),

  API_RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  API_RATE_LIMIT_MAX: z.string().default('200'),

  AUTH_RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  AUTH_RATE_LIMIT_MAX: z.string().default('20'),

  STRIPE_SECRET_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid env vars:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;