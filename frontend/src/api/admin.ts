import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_BASE,
});

// Attach token from localStorage
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getDashboardStats = () =>
  adminApi.get('/order/admin/stats').then((res) => res.data);

export const getPopularFood = (limit = 10) =>
  adminApi.get(`/order/admin/popular-food?limit=${limit}`).then((res) => res.data);

export const getRevenueByCategory = () =>
  adminApi.get('/order/admin/revenue-by-category').then((res) => res.data);

export const getAllOrders = (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  return adminApi.get(`/order?${params.toString()}`).then((res) => res.data);
};