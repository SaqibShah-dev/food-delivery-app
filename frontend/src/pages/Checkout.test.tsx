import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createOrder: vi.fn(),
  createCheckoutSession: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  clearCart: vi.fn(),
  user: null as { name: string } | null,
  loading: false,
  items: [] as Array<{
    food: { _id: string; name: string; price: number; image: string };
    quantity: number;
  }>,
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: mocks.user, loading: mocks.loading }),
}));

vi.mock('../hooks/useCart', () => ({
  useCart: () => ({
    items: mocks.items,
    totalItems: mocks.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: mocks.items.reduce(
      (sum, item) => sum + item.food.price * item.quantity,
      0,
    ),
    clearCart: mocks.clearCart,
  }),
}));

vi.mock('../api/order', () => ({
  createOrder: mocks.createOrder,
}));

vi.mock('../api/payments', () => ({
  createCheckoutSession: mocks.createCheckoutSession,
}));

vi.mock('sonner', () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

import Checkout from './Checkout';
import OrderConfirmation from './OrderConfirmation';

function LocationOutput() {
  const location = useLocation();
  return <p>Current route: {location.pathname}</p>;
}

function renderCheckout() {
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/login" element={<LocationOutput />} />
        <Route path="/register" element={<LocationOutput />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillAddress(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Full name'), 'Alex Example');
  await user.type(screen.getByLabelText('Phone number'), '1234567890');
  await user.type(screen.getByLabelText('Street address'), '1 Main Street');
  await user.type(screen.getByLabelText('City'), 'Town');
  await user.type(screen.getByLabelText('Country'), 'US');
}

describe('Checkout page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = { name: 'Alex' };
    mocks.loading = false;
    mocks.items = [
      {
        food: {
          _id: 'food-1',
          name: 'Soup',
          price: 4.25,
          image: '/soup.jpg',
        },
        quantity: 2,
      },
    ];
  });

  it('waits for authentication restoration', () => {
    mocks.loading = true;
    renderCheckout();
    expect(screen.getByText('Checking your session…')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Checkout' })).not.toBeInTheDocument();
  });

  it('offers login and registration to logged-out customers without clearing cart', () => {
    mocks.user = null;
    renderCheckout();

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/register',
    );
    expect(mocks.clearCart).not.toHaveBeenCalled();
    expect(mocks.createOrder).not.toHaveBeenCalled();
  });

  it('shows empty-cart state and prevents order submission', () => {
    mocks.items = [];
    renderCheckout();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Place COD order/ })).not.toBeInTheDocument();
    expect(mocks.createOrder).not.toHaveBeenCalled();
  });

  it('validates address before making requests', async () => {
    const user = userEvent.setup();
    renderCheckout();
    await user.click(screen.getByRole('button', { name: /Continue to Stripe/ }));

    expect(screen.getByText('Full name is required.')).toBeInTheDocument();
    expect(screen.getByText('Phone number is required.')).toBeInTheDocument();
    expect(mocks.createOrder).not.toHaveBeenCalled();
  });

  it('sends the order request and preserves the cart on failure', async () => {
    mocks.createOrder.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Food is unavailable' } },
    });
    const user = userEvent.setup();
    renderCheckout();
    await fillAddress(user);
    await user.click(screen.getByRole('button', { name: /Continue to Stripe/ }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith('Food is unavailable');
    });
    expect(mocks.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethod: 'stripe',
        items: [{ foodId: 'food-1', quantity: 2 }],
        address: {
          fullName: 'Alex Example',
          phone: '1234567890',
          street: '1 Main Street',
          city: 'Town',
          country: 'US',
        },
      }),
    );
    expect(mocks.clearCart).not.toHaveBeenCalled();
  });

  it('keeps the saved order and cart when Stripe session creation fails', async () => {
    mocks.createOrder.mockResolvedValue({
      data: { _id: 'order-123', totalAmount: 8.5 },
    });
    mocks.createCheckoutSession.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Stripe is unavailable' } },
    });
    const user = userEvent.setup();
    renderCheckout();
    await fillAddress(user);
    await user.click(screen.getByRole('button', { name: /Continue to Stripe/ }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        'Stripe is unavailable Your order is saved; retry here or pay from My Orders.',
      );
    });
    expect(mocks.createOrder).toHaveBeenCalledOnce();
    expect(mocks.createCheckoutSession).toHaveBeenCalledWith('order-123');
    expect(mocks.clearCart).not.toHaveBeenCalled();
  });

  it('creates a COD order, clears the cart and navigates to confirmation', async () => {
    mocks.createOrder.mockResolvedValue({
      data: { _id: 'order-123', totalAmount: 8.5 },
    });
    const user = userEvent.setup();
    renderCheckout();
    await fillAddress(user);
    await user.click(screen.getByRole('radio', { name: /Cash on delivery/ }));
    await user.click(screen.getByRole('button', { name: /Place COD order/ }));

    expect(await screen.findByRole('heading', { name: 'Order placed' })).toBeInTheDocument();
    expect(screen.getByText(/pay the courier when it arrives/)).toBeInTheDocument();
    expect(mocks.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ paymentMethod: 'cod' }),
    );
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
    expect(mocks.clearCart).toHaveBeenCalledOnce();
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Order placed successfully.');
  });

  it('prevents duplicate submissions while order creation is pending', async () => {
    let resolveOrder!: (value: { data: { _id: string; totalAmount: number } }) => void;
    mocks.createOrder.mockReturnValue(
      new Promise((resolve) => {
        resolveOrder = resolve;
      }),
    );
    const user = userEvent.setup();
    renderCheckout();
    await fillAddress(user);
    await user.click(screen.getByRole('radio', { name: /Cash on delivery/ }));
    const submit = screen.getByRole('button', { name: /Place COD order/ });
    await user.click(submit);
    await user.click(submit);

    expect(mocks.createOrder).toHaveBeenCalledOnce();
    resolveOrder({ data: { _id: 'order-123', totalAmount: 8.5 } });
    await waitFor(() => expect(mocks.clearCart).toHaveBeenCalledOnce());
  });
});
