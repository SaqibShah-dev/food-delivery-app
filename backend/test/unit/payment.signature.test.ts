import Stripe from 'stripe';
import { describe, expect, it } from 'vitest';
import { env } from '../../src/config/env.js';
import { paymentService } from '../../src/services/payment.service.js';

describe('Stripe webhook signature verification', () => {
  it('accepts a generated test signature and rejects a tampered payload', async () => {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const payload = JSON.stringify({
      id: 'evt_test_signature',
      object: 'event',
      api_version: null,
      created: 1,
      data: { object: { id: 'cs_test_session', object: 'checkout.session' } },
      livemode: false,
      pending_webhooks: 1,
      request: null,
      type: 'checkout.session.completed',
    });
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: env.STRIPE_WEBHOOK_SECRET,
    });

    await expect(
      paymentService.constructWebhookEvent(Buffer.from(payload), signature),
    ).resolves.toMatchObject({
      id: 'evt_test_signature',
      type: 'checkout.session.completed',
    });

    await expect(
      paymentService.constructWebhookEvent(
        Buffer.from(payload.replace('evt_test_signature', 'evt_tampered')),
        signature,
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
});
