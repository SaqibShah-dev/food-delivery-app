import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

const apiWindowMs = Number(env.API_RATE_LIMIT_WINDOW_MS);
const apiMax = Number(env.API_RATE_LIMIT_MAX);

const authWindowMs = Number(env.AUTH_RATE_LIMIT_WINDOW_MS);
const authMax = Number(env.AUTH_RATE_LIMIT_MAX);

export const apiLimiter = rateLimit({
  windowMs: apiWindowMs,
  limit: apiMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests. Please try again later.',
  },
});

export const authLimiter = rateLimit({
  windowMs: authWindowMs,
  limit: authMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many authentication attempts. Please try again later.',
  },
});