import axios from 'axios';

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setUnauthorizedHandler(
  handler: (() => void) | null
) {
  unauthorizedHandler = handler;
}

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.headers.Authorization
    ) {
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);