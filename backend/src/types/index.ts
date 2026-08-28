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

export interface IOrderItem {
  food: string; 
  quantity: number;
}

export interface IOrder {
  _id?: string;
  user: string;
  items: IOrderItem[];
  totalAmount: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'out-for-delivery'
    | 'delivered';
  paymentId?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}