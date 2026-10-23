import { useEffect } from 'react';
import { X } from 'lucide-react';

import { ORDER_STATUSES } from '../../types';

import type { IOrder, OrderStatus } from '../../types';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  'out-for-delivery': 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-200 text-gray-800',
};

function formatStatus(status: string) {
  return status.replaceAll('-', ' ');
}

interface OrderDetailsModalProps {
  order: IOrder | null;
  updating: boolean;
  onStatusChange: (
    orderId: string,
    status: OrderStatus
  ) => void;
  onClose: () => void;
}

export default function OrderDetailsModal({
  order,
  updating,
  onStatusChange,
  onClose,
}: OrderDetailsModalProps) {
  useEffect(() => {
    if (!order) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
      document.body.style.overflow = '';
    };
  }, [order, onClose]);

  if (!order) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-details-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-6"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Order details
            </p>

            <h2
              id="order-details-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              Order #
              {order._id.slice(-8).toUpperCase()}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {dateFormatter.format(
                new Date(order.createdAt)
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-6 sm:px-7">
          {/* Status summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  statusStyles[order.status]
                }`}
              >
                {formatStatus(order.status)}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  paymentStyles[order.paymentStatus] ||
                  'bg-slate-100 text-slate-700'
                }`}
              >
                {formatStatus(order.paymentStatus)}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order total
              </p>

              <p className="mt-2 text-xl font-bold text-indigo-600">
                {currencyFormatter.format(
                  order.totalAmount
                )}
              </p>
            </div>
          </div>

          {/* Customer and address */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900">
                Customer
              </h3>

              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-slate-500">Name</dt>

                  <dd className="font-medium text-slate-900">
                    {order.user?.name ||
                      order.address.fullName}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">Email</dt>

                  <dd className="break-all font-medium text-slate-900">
                    {order.user?.email || 'Not available'}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">Phone</dt>

                  <dd className="font-medium text-slate-900">
                    {order.address.phone}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900">
                Delivery address
              </h3>

              <address className="mt-3 text-sm not-italic leading-6 text-slate-700">
                {order.address.fullName}
                <br />
                {order.address.street}
                <br />
                {order.address.city},{' '}
                {order.address.country}
              </address>
            </section>
          </div>

          {/* Items */}
          <section className="mt-6">
            <h3 className="text-sm font-bold text-slate-900">
              Items
            </h3>

            <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              {order.items.map((item, index) => (
                <li
                  key={`${order._id}-item-${index}`}
                  className="flex items-center gap-4 p-4"
                >
                  <img
                    src={item.food?.image}
                    alt={
                      item.food?.name ||
                      'Unavailable food item'
                    }
                    loading="lazy"
                    className="h-16 w-16 flex-shrink-0 rounded-xl bg-slate-100 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      {item.food?.name ||
                        'Unavailable item'}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.quantity} ×{' '}
                      {currencyFormatter.format(
                        item.unitPrice
                      )}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {currencyFormatter.format(
                      item.subtotal
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Status update */}
          <section className="mt-6 rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900">
              Update fulfillment status
            </h3>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label
                htmlFor="modal-order-status"
                className="text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="modal-order-status"
                value={order.status}
                disabled={updating}
                onChange={(event) =>
                  onStatusChange(
                    order._id,
                    event.target.value as OrderStatus
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-xs"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>

              {updating && (
                <p
                  role="status"
                  className="text-sm text-slate-500"
                >
                  Updating…
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}