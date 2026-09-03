export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFoodItem {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderItem {
  food: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface IAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  country: string;
}

export interface IOrder {
  _id?: string;
  user: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  address: IAddress;
  createdAt?: Date;
  updatedAt?: Date;
}