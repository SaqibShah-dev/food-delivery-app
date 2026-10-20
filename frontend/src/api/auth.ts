import { api } from './client';
import type {
  IApiResponse,
  IAuthData,
  IAuthUser,
  ILoginInput,
} from '../types';

export async function loginUser(credentials: ILoginInput) {
  const response = await api.post<IApiResponse<IAuthData>>(
    '/auth/login',
    credentials
  );

  return response.data.data;
}
export async function getCurrentUser(
  signal?: AbortSignal
) {
  const response = await api.get<
    IApiResponse<IAuthUser>
  >('/auth/me', { signal });

  return response.data;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await api.post<
    IApiResponse<IAuthData>
  >('/auth/register', input);

  return response.data.data;
}