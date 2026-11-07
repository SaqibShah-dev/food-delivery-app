import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getMyOrders: vi.fn(),
  createCheckoutSession: vi.fn(),
  getFoodImageUrl: vi.fn((image: string) => image),
  user: { name: 'Alex' } as { name: string } | null,
  loading: false,
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: mocks.user, loading: mocks.loading }),
}));

vi.mock('../api/order', () => ({
  getMyOrders: mocks.getMyOrders,
}));

vi.mock('../api/payments', () => ({
  createCheckoutSession: mocks.createCheckoutSession,
}));

vi.mock('../api/food', () => ({
  getFoodImageUrl: mocks.getFoodImageUrl,
}));

import MyOrders from './MyOrders';

function makeOrder(
  id: string,
  paymentStatus: 'pending' | 'paid' | 'failed',
  status: 'pending' | 'cancelled' = 'pending',
) {
  return {
    _id: id,
    user: { _id: 'user-1', name: 'Alex', email: 'alex@example.com' },
    items: [
      {
        food: {
          _id: 'food-1',
          name: 'Soup',
          image: '/soup.jpg',
          category: 'Lunch',
        },
        foodName: 'Soup',
        foodImage: '/soup.jpg',
        quantity: 2,
        unitPrice: 4.25,
        subtotal: 8.5,
      },
    ],
    totalAmount: 8.5,
    status,
    paymentMethod: 'stripe' as const,
    paymentStatus,
    address: {
      fullName: 'Alex Example',
      phone: '1234567890',
      street: '1 Main Street',
      city: 'Town',
      country: 'US',
    },
    createdAt: '2025-01-01T12:00:00.000Z',
    updatedAt: '2025-01-01T12:00:00.000Z',
  };
}

function renderOrders() {
  return render(
    <MemoryRouter>
      <MyOrders />
    </MemoryRouter>,
  );
}

describe('My orders page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = { name: 'Alex' };
    mocks.loading = false;
    mocks.getMyOrders.mockResolvedValue({ data: [] });
  });

  it('waits for authentication restoration and keeps logged-out users out of order history', () => {
    mocks.loading = true;
    mocks.user = null;
    const { rerender } = renderOrders();
    expect(screen.getByText('Checking your session…')).toBeInTheDocument();
    expect(mocks.getMyOrders).not.toHaveBeenCalled();

    mocks.loading = false;
    rerender(
      <MemoryRouter>
        <MyOrders />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Sign in to view orders' })).toBeInTheDocument();
    expect(mocks.getMyOrders).not.toHaveBeenCalled();
  });

  it('shows an empty state and exposes a retry after load errors', async () => {
    mocks.getMyOrders.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Orders unavailable' } },
    });
    renderOrders();

    expect(await screen.findByText('Orders unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('shows pay now only for an unpaid, non-cancelled, non-COD order', async () => {
    mocks.getMyOrders.mockResolvedValue({
      data: [
        makeOrder('order-pending', 'pending'),
        makeOrder('order-paid', 'paid'),
        makeOrder('order-cancelled', 'pending', 'cancelled'),
        { ...makeOrder('order-cod', 'pending'), paymentMethod: 'cod' },
      ],
    });
    renderOrders();

    expect(await screen.findByRole('button', { name: 'Pay now' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Pay now' })).toHaveLength(1);
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('submits the correct order id for payment and displays API errors', async () => {
    mocks.getMyOrders.mockResolvedValue({
      data: [makeOrder('order-pending', 'pending')],
    });
    mocks.createCheckoutSession.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Payment provider unavailable' } },
    });
    const user = userEvent.setup();
    renderOrders();
    await user.click(await screen.findByRole('button', { name: 'Pay now' }));

    expect(mocks.createCheckoutSession).toHaveBeenCalledWith('order-pending');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Payment provider unavailable',
    );
  });
});
