import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  login: vi.fn(),
  findUser: vi.fn(),
  createOrder: vi.fn(),
  getOrdersForUser: vi.fn(),
  getAllOrders: vi.fn(),
  getById: vi.fn(),
  updateOrderStatus: vi.fn(),
  markCashOnDeliveryAsPaid: vi.fn(),
  getDashboardStats: vi.fn(),
  getPopularFoodItems: vi.fn(),
  getRevenueByCategory: vi.fn(),
  getAllAvailable: vi.fn(),
  getAvailableCategories: vi.fn(),
  getAllForAdmin: vi.fn(),
  createFood: vi.fn(),
  updateFood: vi.fn(),
  softDeleteFood: vi.fn(),
  restoreFood: vi.fn(),
  createCheckoutSession: vi.fn(),
  retrievePaidCheckoutSession: vi.fn(),
  constructWebhookEvent: vi.fn(),
  markOrderAsPaid: vi.fn(),
}));

vi.mock('../../src/services/auth.service.js', () => ({
  authService: {
    register: mocks.register,
    login: mocks.login,
  },
}));

vi.mock('../../src/models/User.model.js', () => ({
  User: { findById: mocks.findUser },
  default: { findById: mocks.findUser },
}));

vi.mock('../../src/services/order.service.js', () => ({
  orderService: {
    createOrder: mocks.createOrder,
    getOrdersForUser: mocks.getOrdersForUser,
    getAllOrders: mocks.getAllOrders,
    getById: mocks.getById,
    updateOrderStatus: mocks.updateOrderStatus,
    markCashOnDeliveryAsPaid: mocks.markCashOnDeliveryAsPaid,
    getDashboardStats: mocks.getDashboardStats,
    getPopularFoodItems: mocks.getPopularFoodItems,
    getRevenueByCategory: mocks.getRevenueByCategory,
    markOrderAsPaid: mocks.markOrderAsPaid,
  },
}));

vi.mock('../../src/services/food.service.js', () => ({
  foodService: {
    getAllAvailable: mocks.getAllAvailable,
    getAvailableCategories: mocks.getAvailableCategories,
    getAllForAdmin: mocks.getAllForAdmin,
    create: mocks.createFood,
    updateById: mocks.updateFood,
    softDeleteById: mocks.softDeleteFood,
    restoreById: mocks.restoreFood,
  },
}));

vi.mock('../../src/services/payment.service.js', () => ({
  paymentService: {
    createCheckoutSession: mocks.createCheckoutSession,
    retrievePaidCheckoutSession: mocks.retrievePaidCheckoutSession,
    constructWebhookEvent: mocks.constructWebhookEvent,
  },
}));

import app from '../../src/app.js';

const signingSecret = process.env.JWT_SECRET!;
const customerId = '64c0e1f4d3a5bc0425d1f3b1';
const otherCustomerId = '64c0e1f4d3a5bc0425d1f3b2';

function token(id: string, role: 'user' | 'admin' = 'user') {
  return jwt.sign({ id, role }, signingSecret, { expiresIn: '5m' });
}

describe('Express API security and payment routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated order creation without calling the service', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({ items: [], address: {} });

    expect(response.status).toBe(401);
    expect(mocks.createOrder).not.toHaveBeenCalled();
  });

  it('blocks regular users from admin order routes and permits admins', async () => {
    mocks.getDashboardStats.mockResolvedValue({ totalOrders: 0 });

    const forbidden = await request(app)
      .get('/api/orders/admin/stats')
      .set('Authorization', `Bearer ${token(customerId)}`);
    const allowed = await request(app)
      .get('/api/orders/admin/stats')
      .set('Authorization', `Bearer ${token(customerId, 'admin')}`);

    expect(forbidden.status).toBe(403);
    expect(allowed.status).toBe(200);
  });

  it('does not allow a customer to read another customer’s order', async () => {
    mocks.getById.mockResolvedValue({
      _id: 'order-123',
      user: { _id: otherCustomerId },
    });

    const response = await request(app)
      .get('/api/orders/64c0e1f4d3a5bc0425d1f3c3')
      .set('Authorization', `Bearer ${token(customerId)}`);

    expect(response.status).toBe(403);
  });

  it('registration ignores an injected admin role and returns a regular account', async () => {
    mocks.register.mockResolvedValue({
      _id: customerId,
      name: 'Alex Example',
      email: 'alex@example.com',
      role: 'user',
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Example',
        email: 'alex@example.com',
        password: 'secret12',
        role: 'admin',
      });

    expect(response.status).toBe(201);
    expect(mocks.register).toHaveBeenCalledWith({
      name: 'Alex Example',
      email: 'alex@example.com',
      password: 'secret12',
    });
    expect(response.body.data.user.role).toBe('user');
  });

  it('returns the public current-user shape without password', async () => {
    const user = {
      _id: customerId,
      name: 'Alex Example',
      email: 'alex@example.com',
      role: 'user',
      password: 'hashed-password',
    };
    mocks.findUser.mockReturnValue({
      select: vi.fn().mockResolvedValue(user),
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token(customerId)}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      id: customerId,
      name: 'Alex Example',
      email: 'alex@example.com',
      role: 'user',
    });
    expect(response.body.data).not.toHaveProperty('password');
  });

  it('passes a raw Buffer to webhook processing and marks the matching paid session', async () => {
    const event = {
      id: 'evt_paid',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_paid',
          payment_status: 'paid',
          amount_total: 1250,
          currency: 'usd',
          metadata: { orderId: 'order-123', userId: customerId },
        },
      },
    };
    mocks.constructWebhookEvent.mockResolvedValue(event);

    const response = await request(app)
      .post('/api/payment/webhook')
      .set('stripe-signature', 'test-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: event.id }));

    expect(response.status).toBe(200);
    const [rawBody] = mocks.constructWebhookEvent.mock.calls[0];
    expect(Buffer.isBuffer(rawBody)).toBe(true);
    expect(rawBody.toString()).toBe(JSON.stringify({ id: event.id }));
    expect(mocks.markOrderAsPaid).toHaveBeenCalledWith(
      'order-123',
      customerId,
      'cs_test_paid',
      1250,
      'usd',
    );
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('does not update unpaid, unrelated, or metadata-less webhook events', async () => {
    mocks.constructWebhookEvent
      .mockResolvedValueOnce({
        id: 'evt_unpaid',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_unpaid',
            payment_status: 'unpaid',
            amount_total: 1250,
            currency: 'usd',
            metadata: { orderId: 'order-123', userId: customerId },
          },
        },
      })
      .mockResolvedValueOnce({
        id: 'evt_other',
        type: 'payment_intent.created',
        data: { object: {} },
      })
      .mockResolvedValueOnce({
        id: 'evt_missing_metadata',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_missing',
            payment_status: 'paid',
            metadata: {},
          },
        },
      });

    const body = JSON.stringify({ type: 'event' });
    const sendEvent = () =>
      request(app)
        .post('/api/payment/webhook')
        .set('stripe-signature', 'valid-test-signature')
        .set('Content-Type', 'application/json')
        .send(body);

    expect((await sendEvent()).status).toBe(200);
    expect((await sendEvent()).status).toBe(200);
    expect((await sendEvent()).status).toBe(400);
    expect(mocks.markOrderAsPaid).not.toHaveBeenCalled();
  });

  it('does not acknowledge successful payment when order persistence fails', async () => {
    mocks.constructWebhookEvent.mockResolvedValue({
      id: 'evt_db_failure',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_failure',
          payment_status: 'paid',
          amount_total: 1250,
          currency: 'usd',
          metadata: { orderId: 'order-123', userId: customerId },
        },
      },
    });
    mocks.markOrderAsPaid.mockRejectedValue(new Error('database unavailable'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await request(app)
      .post('/api/payment/webhook')
      .set('stripe-signature', 'test-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_db_failure' }));

    expect(response.status).toBe(500);
    expect(response.body.message).not.toBe('Webhook received');
    expect(response.body.requestId).toBe(response.headers['x-request-id']);
  });

  it('confirms only the session resolved for the authenticated customer', async () => {
    mocks.markOrderAsPaid.mockResolvedValue(undefined);
    mocks.retrievePaidCheckoutSession.mockResolvedValue({
      orderId: 'order-123',
      session: {
        id: 'cs_test_paid',
        payment_status: 'paid',
        amount_total: 1250,
        currency: 'usd',
        metadata: { orderId: 'order-123', userId: customerId },
      },
    });

    const response = await request(app)
      .post('/api/payment/confirm-checkout-session')
      .set('Authorization', `Bearer ${token(customerId)}`)
      .send({ sessionId: 'cs_test_paid' });

    expect(response.status).toBe(200);
    expect(mocks.retrievePaidCheckoutSession).toHaveBeenCalledWith(
      customerId,
      'cs_test_paid',
    );
    expect(mocks.markOrderAsPaid).toHaveBeenCalledWith(
      'order-123',
      customerId,
      'cs_test_paid',
      1250,
      'usd',
    );
  });
});
