import axios from 'axios';
import type {
  IApiResponse,
  IDashboardStats,
  IOrder,
  IOrderFilters,
  IPopularFood,
  IRevenueCategory,
  OrderStatus,
} from '../types';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_BASE,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getDashboardStats = async () => {
  const response = await adminApi.get<IApiResponse<IDashboardStats>>(
    '/orders/admin/stats'
  );

  return response.data;
};

export const getPopularFood = async (limit = 10) => {
  const response = await adminApi.get<IApiResponse<IPopularFood[]>>(
    '/orders/admin/popular-food',
    {
      params: { limit },
    }
  );

  return response.data;
};

export const getRevenueByCategory = async () => {
  const response = await adminApi.get<IApiResponse<IRevenueCategory[]>>(
    '/orders/admin/revenue-by-category'
  );

  return response.data;
};

export const getAllOrders = async (filters?: IOrderFilters) => {
  const response = await adminApi.get<IApiResponse<IOrder[]>>(
    '/orders',
    {
      params: filters,
    }
  );

  return response.data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  const response = await adminApi.patch<IApiResponse<IOrder>>(
    `/orders/${orderId}/status`,
    { status }
  );

  return response.data;
};