import { api } from './client';

import type { IApiResponse } from '../types';

interface ICheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
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