import { useEffect } from "react";
import { X } from "lucide-react";

import { getOrderStatusOptions } from "../../types";
import type { IOrder, OrderStatus } from "../../types";
import { getFoodImageUrl } from "../../api/food";
import { formatCurrency, formatDate, formatStatus } from "../../utils/format";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import PaymentStatusBadge from "../../components/PaymentStatusBadge";

interface OrderDetailsModalProps {
  order: IOrder | null;
  updating: boolean;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onMarkCashCollected: (orderId: string) => void;
  onClose: () => void;
}

export default function OrderDetailsModal({
  order,
  updating,
  onStatusChange,
  onMarkCashCollected,
  onClose,
}: OrderDetailsModalProps) {
  useEffect(() => {
    if (!order) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
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
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
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
              Order #{order._id.slice(-8).toUpperCase()}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formatDate(order.createdAt)}
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

              <div className="mt-2">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment
              </p>

              <div className="mt-2">
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {order.paymentMethod === "cod"
                  ? "Cash on delivery"
                  : "Stripe"}
              </p>
              {order.paymentMethod === "cod" &&
                order.paymentStatus !== "paid" &&
                order.status !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => onMarkCashCollected(order._id)}
                    disabled={updating}
                    className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updating
                      ? "Confirming…"
                      : "Confirm cash collected"}
                  </button>
                )}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order total
              </p>

              <p className="mt-2 text-xl font-bold text-indigo-600">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>

          {/* Customer and address */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900">Customer</h3>

              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Name</dt>
                  <dd className="font-semibold text-slate-800">
                    {order.user?.name || "Anonymous / Deleted account"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-slate-500">Email</dt>
                  <dd className="text-slate-700">
                    {order.user?.email || "—"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900">
                Delivery address
              </h3>

              <div className="mt-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-800">
                  {order.address?.fullName}
                </p>
                <p className="mt-1">{order.address?.street}</p>
                <p>
                  {order.address?.city}, {order.address?.country}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Phone: {order.address?.phone}
                </p>
              </div>
            </section>
          </div>

          {/* Items */}
          <section className="mt-6 rounded-2xl border border-slate-200">
            <h3 className="border-b border-slate-200 px-5 py-4 text-sm font-bold text-slate-900">
              Ordered items ({order.items.length})
            </h3>

            <ul className="divide-y divide-slate-100">
              {order.items.map((item, index) => (
                <li
                  key={`${order._id}-item-${index}`}
                  className="flex items-center gap-4 p-4"
                >
                  <img
                    src={getFoodImageUrl(item.foodImage || item.food?.image || "")}
                    alt={item.foodName || item.food?.name || "Unavailable food item"}
                    loading="lazy"
                    className="h-16 w-16 flex-shrink-0 rounded-xl bg-slate-100 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      {item.foodName || item.food?.name || "Unavailable item"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.quantity} ×{" "}
                      {formatCurrency(item.unitPrice)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.subtotal)}
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
                  onStatusChange(order._id, event.target.value as OrderStatus)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-xs"
              >
                {getOrderStatusOptions(order.status).map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>

              {updating && (
                <p role="status" className="text-sm text-slate-500">
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
