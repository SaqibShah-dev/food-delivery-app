import { createContext } from 'react';

import type { ICartItem, IFoodItem } from '../types';

export interface ICartContext {
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (food: IFoodItem) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  removeItem: (foodId: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<ICartContext | undefined>(
  undefined
);
