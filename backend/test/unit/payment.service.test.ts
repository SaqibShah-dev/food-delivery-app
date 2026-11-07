import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findOne: vi.fn(),
  createSession: vi.fn(),
  retrieveSession: vi.fn(),
  constructEvent: vi.fn(),
}));

vi.mock('stripe', () => {
  class StripeMock {
    static errors = {
      StripeSignatureVerificationError: class StripeSignatureVerificationError extends Error {},
    };

    checkout = {
      sessions: {
        create: mocks.createSession,
        retrieve: mocks.retrieveSession,
      },
    };
    webhooks = { constructEvent: mocks.constructEvent };
  }

  return { default: StripeMock };
});

vi.mock('../../src/models/Order.model.js', () => ({
  default: { findOne: mocks.findOne },
}));

import { paymentService } from '../../src/services/payment.service.js';

function orderQuery(result: unknown) {
  const query = {
    populate: vi.fn(() => query),
    then: (resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };
  return query;
}

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => 'order-123' },
    user: 'user-123',
    paymentMethod: 'stripe',
    paymentStatus: 'pending',
    status: 'pending',
    checkoutSessionId: undefined,
    totalAmount: 8.5,
    items: [
      {
        food: null,
        foodName: 'Saved meal name',
        unitPrice: 4.25,
        quantity: 2,
      },
    ],
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates checkout using saved prices and correct order/user metadata', async () => {
    const order = makeOrder();
    mocks.findOne.mockReturnValue(orderQuery(order));
    mocks.createSession.mockResolvedValue({
      id: 'cs_test_created',
      url: 'https://checkout.example/session',
    });

    const result = await paymentService.createCheckoutSession(
      'user-123',
      'order-123',
    );

    expect(mocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              product_data: { name: 'Saved meal name' },
              unit_amount: 425,
            }),
            quantity: 2,
          }),
        ],
        metadata: { orderId: 'order-123', userId: 'user-123' },
      }),
    );
    expect(order.checkoutSessionId).toBe('cs_test_created');
    expect(order.save).toHaveBeenCalledOnce();
    expect(result.sessionId).toBe('cs_test_created');
  });

  it('rejects orders not found for the requesting owner', async () => {
    mocks.findOne.mockReturnValue(orderQuery(null));

    await expect(
      paymentService.createCheckoutSession('wrong-user', 'order-123'),
    ).rejects.toMatchObject({ status: 404 });
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it.each([
    { paymentStatus: 'paid' },
    { status: 'cancelled' },
  ])('does not create sessions for paid or cancelled orders %#', async (changes) => {
    mocks.findOne.mockReturnValue(orderQuery(makeOrder(changes)));

    await expect(
      paymentService.createCheckoutSession('user-123', 'order-123'),
    ).rejects.toMatchObject({ status: 400 });
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it('reuses an active checkout session', async () => {
    const order = makeOrder({ checkoutSessionId: 'cs_test_existing' });
    mocks.findOne.mockReturnValue(orderQuery(order));
    mocks.retrieveSession.mockResolvedValue({
      id: 'cs_test_existing',
      status: 'open',
      url: 'https://checkout.example/existing',
    });

    await expect(
      paymentService.createCheckoutSession('user-123', 'order-123'),
    ).resolves.toMatchObject({
      sessionId: 'cs_test_existing',
      checkoutUrl: 'https://checkout.example/existing',
    });
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it('confirms only paid sessions belonging to the owner and order', async () => {
    mocks.retrieveSession.mockResolvedValue({
      id: 'cs_test_valid',
      payment_status: 'paid',
      metadata: { orderId: 'order-123', userId: 'user-123' },
    });
    mocks.findOne.mockReturnValue(
      orderQuery(makeOrder({ checkoutSessionId: 'cs_test_valid' })),
    );

    await expect(
      paymentService.retrievePaidCheckoutSession('user-123', 'cs_test_valid'),
    ).resolves.toMatchObject({ orderId: 'order-123' });

    await expect(
      paymentService.retrievePaidCheckoutSession('other-user', 'cs_test_valid'),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('rejects unpaid sessions and session IDs not linked to the order', async () => {
    mocks.retrieveSession.mockResolvedValue({
      id: 'cs_test_other',
      payment_status: 'unpaid',
      metadata: { orderId: 'order-123', userId: 'user-123' },
    });
    await expect(
      paymentService.retrievePaidCheckoutSession('user-123', 'cs_test_other'),
    ).rejects.toMatchObject({ status: 409 });

    mocks.retrieveSession.mockResolvedValue({
      id: 'cs_test_other',
      payment_status: 'paid',
      metadata: { orderId: 'order-123', userId: 'user-123' },
    });
    mocks.findOne.mockReturnValue(
      orderQuery(makeOrder({ checkoutSessionId: 'cs_test_expected' })),
    );
    await expect(
      paymentService.retrievePaidCheckoutSession('user-123', 'cs_test_other'),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('rejects missing and invalid webhook signatures', async () => {
    await expect(
      paymentService.constructWebhookEvent(Buffer.from('{}'), undefined),
    ).rejects.toMatchObject({ status: 400 });

    const StripeSignatureError = (
      await import('stripe')
    ).default.errors.StripeSignatureVerificationError;
    mocks.constructEvent.mockImplementation(() => {
      throw new StripeSignatureError('invalid-signature', 'payload');
    });
    await expect(
      paymentService.constructWebhookEvent(
        Buffer.from('{}'),
        'invalid-signature',
      ),
    ).rejects.toMatchObject({ status: 400, message: 'Invalid Stripe signature' });
  });
});
