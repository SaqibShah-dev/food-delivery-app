import { api } from './client';

import type {
  IApiResponse,
  IAuthData,
  ILoginInput,
} from '../types';

export async function loginUser(credentials: ILoginInput) {
  const response = await api.post<IApiResponse<IAuthData>>(
    '/auth/login',
    credentials
  );

  return response.data.data;
}