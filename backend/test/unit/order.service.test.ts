import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findFood: vi.fn(),
  createOrder: vi.fn(),
  findOrder: vi.fn(),
  updateOrder: vi.fn(),
}));

vi.mock('../../src/models/FoodItem.model.js', () => ({
  default: { find: mocks.findFood },
}));

vi.mock('../../src/models/Order.model.js', () => ({
  default: {
    create: mocks.createOrder,
    findOne: mocks.findOrder,
    findOneAndUpdate: mocks.updateOrder,
  },
}));

import { orderService } from '../../src/services/order.service.js';

const foodId = '64c0e1f4d3a5bc0425d1f3b1';
const userId = '64c0e1f4d3a5bc0425d1f3b2';

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an order using current database prices and snapshots', async () => {
    mocks.findFood.mockResolvedValue([
      {
        _id: { toString: () => foodId },
        name: 'Soup',
        image: '/soup.jpg',
        category: 'Lunch',
        price: 4.25,
        isAvailable: true,
      },
    ]);
    mocks.createOrder.mockImplementation(async (order) => order);

    const order = await orderService.createOrder(
      userId,
      [{ foodId, quantity: 3 }],
      {
        fullName: 'Alex Example',
        phone: '1234567890',
        street: '1 Main Street',
        city: 'Town',
        country: 'US',
      },
    );

    expect(mocks.findFood).toHaveBeenCalledWith({
      _id: { $in: [foodId] },
      isAvailable: true,
    });
    expect(mocks.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        user: userId,
        totalAmount: 12.75,
        items: [
          expect.objectContaining({
            food: foodId,
            quantity: 3,
            unitPrice: 4.25,
            subtotal: 12.75,
            foodName: 'Soup',
          }),
        ],
      }),
    );
    expect(order.totalAmount).toBe(12.75);
  });

  it('rejects unavailable food without creating an order', async () => {
    mocks.findFood.mockResolvedValue([]);

    await expect(
      orderService.createOrder(
        userId,
        [{ foodId, quantity: 1 }],
        {
          fullName: 'Alex Example',
          phone: '1234567890',
          street: '1 Main Street',
          city: 'Town',
          country: 'US',
        },
      ),
    ).rejects.toMatchObject({ status: 400 });

    expect(mocks.createOrder).not.toHaveBeenCalled();
  });

  it('refuses to mark a payment paid when the amount or currency is wrong', async () => {
    mocks.findOrder.mockResolvedValue({
      paymentMethod: 'stripe',
      checkoutSessionId: 'cs_test_valid',
      paymentStatus: 'pending',
      status: 'pending',
      totalAmount: 12.75,
    });

    await expect(
      orderService.markOrderAsPaid(
        'order-id',
        userId,
        'cs_test_valid',
        1274,
        'usd',
      ),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      orderService.markOrderAsPaid(
        'order-id',
        userId,
        'cs_test_valid',
        1275,
        'eur',
      ),
    ).rejects.toMatchObject({ status: 400 });

    expect(mocks.updateOrder).not.toHaveBeenCalled();
  });

  it('makes duplicate delivery of the same paid session idempotent', async () => {
    const paidOrder = {
      paymentMethod: 'stripe',
      checkoutSessionId: 'cs_test_valid',
      paymentStatus: 'paid',
      paymentId: 'cs_test_valid',
      status: 'pending',
      totalAmount: 12.75,
    };
    mocks.findOrder.mockResolvedValue(paidOrder);

    await expect(
      orderService.markOrderAsPaid(
        'order-id',
        userId,
        'cs_test_valid',
        1275,
        'usd',
      ),
    ).resolves.toBe(paidOrder);

    expect(mocks.updateOrder).not.toHaveBeenCalled();
  });

  it('rejects a payment attempt from a different owner', async () => {
    mocks.findOrder.mockResolvedValue(null);

    await expect(
      orderService.markOrderAsPaid(
        'order-id',
        userId,
        'cs_test_valid',
        1275,
        'usd',
      ),
    ).rejects.toMatchObject({ status: 404 });

    expect(mocks.updateOrder).not.toHaveBeenCalled();
  });
});
