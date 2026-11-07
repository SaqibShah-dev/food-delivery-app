import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '../../src/validators/auth.validator.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../../src/validators/order.validator.js';

const address = {
  fullName: 'Alex Example',
  phone: '1234567890',
  street: '1 Main Street',
  city: 'Town',
  country: 'US',
};

describe('authentication validators', () => {
  it('accepts a valid registration and normalizes email', () => {
    expect(
      registerSchema.parse({
        name: ' Alex ',
        email: 'ALEX@example.com',
        password: 'secret',
        role: 'admin',
      }),
    ).toEqual({
      name: 'Alex',
      email: 'alex@example.com',
      password: 'secret',
    });
  });

  it('rejects missing registration fields and an invalid email', () => {
    expect(registerSchema.safeParse({}).success).toBe(false);
    expect(
      registerSchema.safeParse({
        name: 'Alex',
        email: 'not-an-email',
        password: 'secret',
      }).success,
    ).toBe(false);
  });

  it('accepts the schema minimum login password without applying registration rules', () => {
    expect(
      loginSchema.safeParse({
        email: 'alex@example.com',
        password: '123456',
      }).success,
    ).toBe(true);
    expect(loginSchema.safeParse({ email: 'alex@example.com' }).success).toBe(
      false,
    );
  });
});

describe('order validators', () => {
  it('accepts a valid order and defaults the payment method', () => {
    expect(
      createOrderSchema.parse({
        items: [{ foodId: '64c0e1f4d3a5bc0425d1f3b1', quantity: '99' }],
        address,
      }),
    ).toMatchObject({
      paymentMethod: 'stripe',
      items: [{ quantity: 99 }],
    });
  });

  it.each([
    {},
    { items: [], address },
    { items: [{ foodId: 'bad-id', quantity: 1 }], address },
    { items: [{ foodId: '64c0e1f4d3a5bc0425d1f3b1', quantity: 0 }], address },
    { items: [{ foodId: '64c0e1f4d3a5bc0425d1f3b1', quantity: 100 }], address },
    {
      items: [{ foodId: '64c0e1f4d3a5bc0425d1f3b1', quantity: 'many' }],
      address,
    },
    {
      items: [{ foodId: '64c0e1f4d3a5bc0425d1f3b1', quantity: 1 }],
      address: { ...address, city: '' },
    },
  ])('rejects invalid order input %#', (input) => {
    expect(createOrderSchema.safeParse(input).success).toBe(false);
  });

  it('validates fulfillment status values', () => {
    expect(updateOrderStatusSchema.parse({ status: 'preparing' })).toEqual({
      status: 'preparing',
    });
    expect(updateOrderStatusSchema.safeParse({ status: 'unknown' }).success).toBe(
      false,
    );
  });
});
