import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must contain at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),

  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),

  password: z
    .string()
    .min(6, 'Password must contain at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),

  // Secure mode:
  // Never accept role from public registration.
  // Every newly registered person becomes a normal user.
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),

  password: z.string().min(1, 'Password is required'),
});