// Order fulfillment statuses
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out-for-delivery',
  'delivered',
  'cancelled',
] as const;

export const MAX_ORDER_ITEM_QUANTITY = 99;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out-for-delivery', 'cancelled'],
  'out-for-delivery': ['delivered'],
  delivered: [],
  cancelled: [],
};

export function getOrderStatusOptions(status: OrderStatus): OrderStatus[] {
  return [status, ...ORDER_STATUS_TRANSITIONS[status]];
}

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export type PaymentMethod = 'stripe' | 'cod';

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
  foodName?: string;
  foodImage?: string;
  foodCategory?: string;
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
  paymentMethod?: PaymentMethod;
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

export interface ICartItem {
  food: IFoodItem;
  quantity: number;
}

export interface IOrderAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  country: string;
}

export interface ICreateOrderInput {
  paymentMethod: PaymentMethod;
  items: {
    foodId: string;
    quantity: number;
  }[];
  address: IOrderAddress;
}

export interface IOrderApiResponse {
  _id?: string;
  user: string;
  items: {
    food: string;
    quantity: number;
    foodName?: string;
    foodImage?: string;
    foodCategory?: string;
    unitPrice: number;
    subtotal: number;
  }[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  address: IOrderAddress;
  createdAt?: string;
}
export interface IPopulatedOrderItem {
  food: {
    _id: string;
    name: string;
    image: string;
    category: string;
  } | null;
  quantity: number;
  foodName?: string;
  foodImage?: string;
  foodCategory?: string;
  unitPrice: number;
  subtotal: number;
}

export interface IPopulatedOrder {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: IPopulatedOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  address: IOrderAddress;
  createdAt: string;
  updatedAt: string;
}