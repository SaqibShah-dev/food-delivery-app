import { api } from './client';

import type { IApiResponse } from '../types';

interface ICheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}

interface IConfirmCheckoutSessionResponse {
  orderId: string;
  paymentStatus: 'paid';
}

export async function createCheckoutSession(
  orderId: string
) {
  const response = await api.post<
    IApiResponse<ICheckoutSessionResponse>
  >('/payment/create-checkout-session', {
    orderId,
  });

  return response.data;
}

export async function confirmCheckoutSession(sessionId: string) {
  const response = await api.post<
    IApiResponse<IConfirmCheckoutSessionResponse>
  >('/payment/confirm-checkout-session', { sessionId });

  return response.data;
}