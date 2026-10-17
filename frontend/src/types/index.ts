// Order fulfillment statuses
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out-for-delivery',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

// Standard backend response wrapper
export interface IApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Delivery address
export interface IAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  country: string;
}

// Customer details populated by admin order endpoints
export interface IOrderCustomer {
  _id: string;
  name: string;
  email: string;
}

// Food details populated inside an order
export interface IOrderFood {
  _id: string;
  name: string;
  image?: string;
  category?: string;
}

export interface IOrderItem {
  food: IOrderFood | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Admin order response with populated customer and food details
export interface IOrder {
  _id: string;
  user: IOrderCustomer | null;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  address: IAddress;
  createdAt: string;
  updatedAt: string;
}

// Admin order query parameters
export interface IOrderFilters {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

// Dashboard statistics
export interface IDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: IOrder[];
}

// Popular food analytics
export interface IPopularFood {
  foodId: string;
  name: string;
  image?: string;
  category?: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

// Revenue by category analytics
export interface IRevenueCategory {
  category: string;
  totalRevenue: number;
  totalQuantity: number;
  orderCount: number;
}
export interface IFoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IFoodFormValues {
  name: string;
  description: string;
  price: string;
  category: string;
}

export type UserRole = 'user' | 'admin';

export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthData {
  token: string;
  user: IAuthUser;
}

export interface IPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IFoodMenuResponse {
  items: IFoodItem[];
  pagination: IPagination;
}

export interface IFoodMenuFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}