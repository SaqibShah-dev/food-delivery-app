import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_BASE,
});

// Attach the current JWT before every request.
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getDashboardStats = () =>
  adminApi.get('/orders/admin/stats').then((res) => res.data);

export const getPopularFood = (limit = 10) =>
  adminApi
    .get('/orders/admin/popular-food', {
      params: { limit },
    })
    .then((res) => res.data);

export const getRevenueByCategory = () =>
  adminApi
    .get('/orders/admin/revenue-by-category')
    .then((res) => res.data);

export const getAllOrders = (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) =>
  adminApi.get('/orders', { params: filters }).then((res) => res.data);

  export const updateOrderStatus = (
  orderId: string,
  status: string
) =>
  adminApi
    .patch(`/orders/${orderId}/status`, { status })
    .then((res) => res.data);
