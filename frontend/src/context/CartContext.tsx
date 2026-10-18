import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import type { ICartItem, IFoodItem } from '../types';

interface ICartContext {
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

const CART_STORAGE_KEY = 'foodflow-cart';

function readStoredCart(): ICartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is ICartItem =>
        Boolean(item) &&
        typeof item === 'object' &&
        Boolean((item as ICartItem).food?._id) &&
        typeof (item as ICartItem).quantity === 'number' &&
        (item as ICartItem).quantity > 0
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ICartItem[]>(readStoredCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((food: IFoodItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.food._id === food._id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.food._id === food._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { food, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback(
    (foodId: string, quantity: number) => {
      setItems((currentItems) => {
        if (quantity <= 0) {
          return currentItems.filter(
            (item) => item.food._id !== foodId
          );
        }

        return currentItems.map((item) =>
          item.food._id === foodId
            ? { ...item, quantity }
            : item
        );
      });
    },
    []
  );

  const removeItem = useCallback((foodId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.food._id !== foodId)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () =>
      items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.food.price * item.quantity,
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalPrice,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      totalItems,
      totalPrice,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}