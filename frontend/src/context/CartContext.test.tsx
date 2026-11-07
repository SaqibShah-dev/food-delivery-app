import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CartProvider } from './CartContext';
import { useCart } from '../hooks/useCart';
import type { IFoodItem } from '../types';

const food: IFoodItem = {
  _id: 'food-1',
  name: 'Soup',
  description: 'Warm soup',
  price: 4.25,
  image: '/soup.jpg',
  category: 'Lunch',
  isAvailable: true,
  createdAt: '',
  updatedAt: '',
};

function CartProbe() {
  const cart = useCart();

  return (
    <section>
      <p>Items: {cart.totalItems}</p>
      <p>Total: {cart.totalPrice.toFixed(2)}</p>
      <p>Soup quantity: {cart.items[0]?.quantity ?? 0}</p>
      <button onClick={() => cart.addItem(food)}>Add soup</button>
      <button onClick={() => cart.updateQuantity(food._id, 3)}>
        Set quantity to three
      </button>
      <button onClick={() => cart.removeItem(food._id)}>Remove soup</button>
      <button onClick={cart.clearCart}>Clear cart</button>
    </section>
  );
}

function renderCart() {
  return render(
    <CartProvider>
      <CartProbe />
    </CartProvider>,
  );
}

describe('CartProvider', () => {
  it('adds and combines items, updates quantities, computes totals and removes items', async () => {
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole('button', { name: 'Add soup' }));
    await user.click(screen.getByRole('button', { name: 'Add soup' }));
    expect(screen.getByText('Items: 2')).toBeInTheDocument();
    expect(screen.getByText('Soup quantity: 2')).toBeInTheDocument();
    expect(screen.getByText('Total: 8.50')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Set quantity to three' }),
    );
    expect(screen.getByText('Items: 3')).toBeInTheDocument();
    expect(screen.getByText('Total: 12.75')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove soup' }));
    expect(screen.getByText('Items: 0')).toBeInTheDocument();
    expect(screen.getByText('Total: 0.00')).toBeInTheDocument();
  });

  it('restores valid persisted state and persists mutations', async () => {
    localStorage.setItem(
      'foodflow-cart',
      JSON.stringify([{ food, quantity: 2 }]),
    );
    const user = userEvent.setup();
    renderCart();

    expect(screen.getByText('Items: 2')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Set quantity to three' }),
    );

    await waitFor(() => {
      expect(
        JSON.parse(localStorage.getItem('foodflow-cart') || '[]')[0].quantity,
      ).toBe(3);
    });
  });

  it('safely ignores malformed persisted JSON', () => {
    localStorage.setItem('foodflow-cart', '{broken');
    renderCart();

    expect(screen.getByText('Items: 0')).toBeInTheDocument();
    expect(screen.getByText('Total: 0.00')).toBeInTheDocument();
  });

  it('clears localStorage immediately when the cart is cleared', () => {
    localStorage.setItem(
      'foodflow-cart',
      JSON.stringify([{ food, quantity: 1 }]),
    );
    renderCart();

    fireEvent.click(screen.getByRole('button', { name: 'Clear cart' }));

    expect(localStorage.getItem('foodflow-cart')).toBeNull();
    expect(screen.getByText('Items: 0')).toBeInTheDocument();
  });
});
