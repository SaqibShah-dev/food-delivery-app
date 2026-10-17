import axios from 'axios';
import type {
  IApiResponse,
  IFoodItem,
} from '../types';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const foodApi = axios.create({
  baseURL: API_BASE,
});

foodApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getFoodImageUrl(image: string): string {
  const apiUrl = new URL(API_BASE, window.location.origin);

  return new URL(image, apiUrl.origin).toString();
}

export async function getAdminFoodItems() {
  const response = await foodApi.get<IApiResponse<IFoodItem[]>>(
    '/food/admin/all'
  );

  return response.data;
}

export async function createFoodItem(formData: FormData) {
  const response = await foodApi.post<IApiResponse<IFoodItem>>(
    '/food',
    formData
  );

  return response.data;
}

export async function updateFoodItem(
  foodId: string,
  formData: FormData
) {
  const response = await foodApi.patch<IApiResponse<IFoodItem>>(
    `/food/${foodId}`,
    formData
  );

  return response.data;
}

export async function hideFoodItem(foodId: string) {
  const response = await foodApi.delete<IApiResponse<IFoodItem>>(
    `/food/${foodId}`
  );

  return response.data;
}

export async function restoreFoodItem(foodId: string) {
  const response = await foodApi.patch<IApiResponse<IFoodItem>>(
    `/food/${foodId}/restore`
  );

  return response.data;
}