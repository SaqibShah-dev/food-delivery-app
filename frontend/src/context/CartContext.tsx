import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import type { ICartItem, IFoodItem } from '../types';
import { CartContext } from './cart-context';
import { getCartTotal } from '../utils/cart';

const MAX_ITEM_QUANTITY = 99;

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
        (item as ICartItem).quantity > 0 &&
        (item as ICartItem).quantity <= MAX_ITEM_QUANTITY
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
        if (existingItem.quantity >= MAX_ITEM_QUANTITY) {
          return currentItems;
        }

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
      if (!Number.isInteger(quantity)) {
        return;
      }

      setItems((currentItems) => {
        if (quantity <= 0) {
          return currentItems.filter(
            (item) => item.food._id !== foodId
          );
        }

        return currentItems.map((item) =>
          item.food._id === foodId
            ? {
                ...item,
                quantity: Math.min(quantity, MAX_ITEM_QUANTITY),
              }
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
    localStorage.removeItem(CART_STORAGE_KEY);
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () =>
      items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => getCartTotal(
      items.map(({ food, quantity }) => ({
        price: food.price,
        quantity,
      })),
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