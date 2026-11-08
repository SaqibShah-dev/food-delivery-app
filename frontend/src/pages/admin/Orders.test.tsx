import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAllOrders: vi.fn(),
  updateOrderStatus: vi.fn(),
  confirmCashOnDeliveryPayment: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('../../api/admin', () => ({
  getAllOrders: mocks.getAllOrders,
  updateOrderStatus: mocks.updateOrderStatus,
  confirmCashOnDeliveryPayment: mocks.confirmCashOnDeliveryPayment,
}));

vi.mock('./OrderDetailsModal', () => ({
  default: () => null,
}));

vi.mock('sonner', () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

import Orders from './Orders';

function makeOrder(
  overrides: Partial<{
    _id: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentMethod: 'stripe' | 'cod';
    paymentStatus: 'pending' | 'paid';
  }> = {},
) {
  return {
    _id: 'order-12345678',
    user: {
      _id: 'user-1',
      name: 'Alex Example',
      email: 'alex@example.com',
    },
    items: [
      {
        food: { _id: 'food-1', name: 'Soup' },
        foodName: 'Soup',
        quantity: 2,
        unitPrice: 4.25,
        subtotal: 8.5,
      },
    ],
    totalAmount: 8.5,
    status: 'pending' as const,
    paymentMethod: 'stripe' as const,
    paymentStatus: 'pending' as const,
    address: {
      fullName: 'Alex Example',
      phone: '1234567890',
      street: '1 Main Street',
      city: 'Town',
      country: 'US',
    },
    createdAt: '2025-01-01T12:00:00.000Z',
    updatedAt: '2025-01-01T12:00:00.000Z',
    ...overrides,
  };
}

function renderOrders() {
  return render(<Orders />);
}

describe('Admin orders page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAllOrders.mockResolvedValue({ data: [makeOrder()] });
  });

  it('loads and displays orders and applies status filters', async () => {
    const user = userEvent.setup();
    renderOrders();
    expect(await screen.findAllByText('Alex Example')).toHaveLength(2);

    await user.selectOptions(screen.getByLabelText('Order status'), 'pending');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => {
      expect(mocks.getAllOrders).toHaveBeenLastCalledWith({
        status: 'pending',
      });
    });
  });

  it('updates order fulfillment status and reports API failures', async () => {
    const updatedOrder = makeOrder({ status: 'confirmed' });
    mocks.updateOrderStatus.mockResolvedValue({ data: updatedOrder });
    const user = userEvent.setup();
    renderOrders();
    await screen.findAllByText('Alex Example');

    const statusSelects = screen.getAllByLabelText('Update status');
    await user.selectOptions(statusSelects[0], 'confirmed');
    expect(mocks.updateOrderStatus).toHaveBeenCalledWith(
      'order-12345678',
      'confirmed',
    );
    expect(await screen.findAllByDisplayValue('confirmed')).toHaveLength(2);
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Order status updated.');

    mocks.updateOrderStatus.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Status update rejected' } },
    });
    const updatedSelect = screen.getAllByLabelText('Update status')[0];
    await user.selectOptions(updatedSelect, 'cancelled');
    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith('Status update rejected');
    });
    expect(screen.getAllByDisplayValue('confirmed')).toHaveLength(2);
  });

  it('confirms cash collection only after explicit admin confirmation', async () => {
    mocks.getAllOrders.mockResolvedValue({
      data: [makeOrder({ paymentMethod: 'cod' })],
    });
    const updatedOrder = makeOrder({
      paymentMethod: 'cod',
      paymentStatus: 'paid',
    });
    mocks.confirmCashOnDeliveryPayment.mockResolvedValue({ data: updatedOrder });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderOrders();
    expect(
      await screen.findAllByRole('button', { name: 'Confirm cash collected' }),
    ).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Confirm cash collected' })[0]);
    expect(window.confirm).toHaveBeenCalledOnce();
    expect(mocks.confirmCashOnDeliveryPayment).toHaveBeenCalledWith(
      'order-12345678',
    );
    await waitFor(() => {
      expect(screen.getAllByText('paid')).toHaveLength(2);
    });
  });

  it('rejects invalid date ranges without making a filtered request', async () => {
    const user = userEvent.setup();
    renderOrders();
    await screen.findAllByText('Alex Example');
    await user.type(screen.getByLabelText('Start date'), '2025-02-01');
    await user.type(screen.getByLabelText('End date'), '2025-01-01');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Start date must be on or before end date.',
    );
    expect(mocks.getAllOrders).toHaveBeenCalledOnce();
  });
});
