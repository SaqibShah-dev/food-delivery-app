import { useEffect, useState } from 'react';
import {
  getAllOrders,
  updateOrderStatus,
} from '../../api/admin';

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out-for-delivery',
  'delivered',
  'cancelled',
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

type OrderItem = {
  food?: {
    _id?: string;
    name?: string;
    image?: string;
    category?: string;
  } | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type Order = {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  address: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    country: string;
  };
  createdAt: string;
};

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  'out-for-delivery': 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStyles: Record<Order['paymentStatus'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-200 text-gray-800',
};

function formatStatus(status: string) {
  return status.replaceAll('-', ' ');
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllOrders({
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setOrders(response.data);
    } catch (err: any) {
      console.error('Failed to load orders:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load orders'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleApplyFilters = () => {
    loadOrders();
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');

    window.setTimeout(() => {
      loadOrders();
    }, 0);
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    const order = orders.find((item) => item._id === orderId);

    if (!order || order.status === newStatus) {
      return;
    }

    setUpdatingOrderId(orderId);
    setError(null);

    try {
      const response = await updateOrderStatus(orderId, newStatus);

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === orderId
            ? response.data
            : currentOrder
        )
      );
    } catch (err: any) {
      console.error('Failed to update order status:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update order status'
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-indigo-600">
            Administration
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Orders
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Review customer orders and update their fulfillment status.
          </p>
        </div>

        <section className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Order status
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All statuses</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Start date
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                End date
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleApplyFilters}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Apply filters
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All orders
            </h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No orders match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Customer
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Items
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Total
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {orders.map((order) => {
                    const isUpdating = updatingOrderId === order._id;

                    return (
                      <tr key={order._id} className="align-top hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {order.user?.name || order.address.fullName}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {order.user?.email || order.address.phone}
                          </p>
                        </td>

                        <td className="max-w-xs px-5 py-4">
                          <p className="text-sm text-gray-700">
                            {order.items
                              .map(
                                (item) =>
                                  `${item.quantity}× ${
                                    item.food?.name || 'Unavailable item'
                                  }`
                              )
                              .join(', ')}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              paymentStyles[order.paymentStatus]
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                                statusStyles[order.status]
                              }`}
                            >
                              {formatStatus(order.status)}
                            </span>

                            <select
                              aria-label={`Update status for order ${order._id}`}
                              value={order.status}
                              disabled={isUpdating}
                              onChange={(event) =>
                                handleStatusChange(
                                  order._id,
                                  event.target.value as OrderStatus
                                )
                              }
                              className="block w-full min-w-40 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {formatStatus(status)}
                                </option>
                              ))}
                            </select>

                            {isUpdating && (
                              <p className="text-xs text-gray-500">
                                Updating…
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}