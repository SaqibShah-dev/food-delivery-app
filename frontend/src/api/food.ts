import { api as foodApi, API_BASE } from './client';

import type {
  IApiResponse,
  IFoodItem,
  IFoodMenuFilters,
  IFoodMenuResponse,
} from '../types';

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

export async function getAvailableFoodItems(
  filters: IFoodMenuFilters = {},
  signal?: AbortSignal
) {
  const response = await foodApi.get<
    IApiResponse<IFoodMenuResponse>
  >('/food', {
    params: filters,
    signal,
  });

  return response.data;
}

export async function getAvailableFoodCategories(
  signal?: AbortSignal
) {
  const response = await foodApi.get<IApiResponse<string[]>>(
    '/food/categories',
    { signal }
  );

  return response.data;
}