import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import { getAllOrders, updateOrderStatus } from "../../api/admin";

import { ORDER_STATUSES } from "../../types";

import type {
  IOrder,
  IOrderFilters,
  OrderStatus,
  PaymentStatus,
} from "../../types";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  "out-for-delivery": "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStyles: Record<PaymentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-200 text-gray-800",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatStatus(status: string) {
  return status.replaceAll("-", " ");
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export default function Orders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const latestRequest = useRef(0);
  const updateInProgress = useRef(false);
  const appliedFilters = useRef<IOrderFilters>({});

  const loadOrders = useCallback(async (filters: IOrderFilters = {}) => {
    const requestId = ++latestRequest.current;

    setLoading(true);
    setError(null);

    try {
      const response = await getAllOrders(filters);

      if (requestId !== latestRequest.current) {
        return;
      }

      setOrders(response.data);
      appliedFilters.current = { ...filters };
    } catch (err: unknown) {
      if (requestId === latestRequest.current) {
        setError(getErrorMessage(err, "Failed to load orders"));
      }
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadOrders();

    return () => {
      latestRequest.current += 1;
    };
  }, [loadOrders]);

  const handleApplyFilters = () => {
    if (startDate && endDate && startDate > endDate) {
      setError("Start date must be on or before end date.");

      return;
    }

    const filters: IOrderFilters = {};

    if (statusFilter) {
      filters.status = statusFilter;
    }

    if (startDate) {
      filters.startDate = startDate;
    }

    if (endDate) {
      filters.endDate = endDate;
    }

    void loadOrders(filters);
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setStartDate("");
    setEndDate("");

    void loadOrders();
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    if (updateInProgress.current) {
      return;
    }

    const order = orders.find((item) => item._id === orderId);

    if (!order || order.status === newStatus) {
      return;
    }

    updateInProgress.current = true;
    setUpdatingOrderId(orderId);
    setError(null);

    try {
      const response = await updateOrderStatus(orderId, newStatus);

      const updatedOrder = response.data;

      setOrders((currentOrders) => {
        const updatedOrders = currentOrders.map((currentOrder) =>
          currentOrder._id === orderId ? updatedOrder : currentOrder,
        );

        const appliedStatus = appliedFilters.current.status;

        return appliedStatus
          ? updatedOrders.filter(
              (currentOrder) => currentOrder.status === appliedStatus,
            )
          : updatedOrders;
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update order status."));
    } finally {
      updateInProgress.current = false;
      setUpdatingOrderId(null);
    }
  };

  const controlsDisabled = loading || updatingOrderId !== null;

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-indigo-600">Administration</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Orders
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Review customer orders and update their fulfillment status.
          </p>
        </div>

        {/* Filters */}
        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Order status
              </span>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as OrderStatus | "")
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                End date
              </span>

              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleApplyFilters}
                disabled={controlsDisabled}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Apply
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                disabled={controlsDisabled}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Orders */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Orders</h2>

            <span
              aria-live="polite"
              className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
            >
              {loading
                ? "Loading…"
                : `${orders.length} ${
                    orders.length === 1 ? "order" : "orders"
                  }`}
            </span>
          </div>

          {loading ? (
            <div
              role="status"
              className="p-10 text-center text-sm text-gray-500"
            >
              Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              {error
                ? "Orders could not be displayed. Check the error above."
                : "No orders match the selected filters."}
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="divide-y divide-gray-100 lg:hidden">
                {orders.map((order) => {
                  const isUpdating = updatingOrderId === order._id;

                  return (
                    <article key={order._id} className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {order.user?.name || order.address.fullName}
                          </p>

                          <p className="mt-1 truncate text-xs text-gray-500">
                            {order.user?.email || order.address.phone}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                        </div>

                        <p className="text-lg font-bold text-gray-900">
                          {currencyFormatter.format(order.totalAmount)}
                        </p>
                      </div>

                      <ul className="mt-4 space-y-1 text-sm text-gray-700">
                        {order.items.map((item, index) => (
                          <li key={`${order._id}-item-${index}`}>
                            {item.quantity}×{" "}
                            {item.food?.name || "Unavailable item"}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            statusStyles[order.status]
                          }`}
                        >
                          {formatStatus(order.status)}
                        </span>

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            paymentStyles[order.paymentStatus]
                          }`}
                        >
                          {order.paymentStatus}
                        </span>

                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor={`status-${order._id}`}
                          className="mb-1 block text-xs font-medium text-gray-600"
                        >
                          Update status
                        </label>

                        <select
                          id={`status-${order._id}`}
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(event) => {
                            void handleStatusChange(
                              order._id,
                              event.target.value as OrderStatus,
                            );
                          }}
                          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {formatStatus(status)}
                            </option>
                          ))}
                        </select>

                        {isUpdating && (
                          <p
                            role="status"
                            className="mt-2 text-xs text-gray-500"
                          >
                            Updating…
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Customer",
                        "Items",
                        "Total",
                        "Payment",
                        "Status",
                        "Date",
                      ].map((heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 bg-white">
                    {orders.map((order) => {
                      const isUpdating = updatingOrderId === order._id;

                      return (
                        <tr
                          key={order._id}
                          className="align-top transition hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-900">
                              {order.user?.name || order.address.fullName}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {order.user?.email || order.address.phone}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                          </td>

                          <td className="max-w-xs px-5 py-4">
                            <p className="text-sm text-gray-700">
                              {order.items
                                .map(
                                  (item) =>
                                    `${item.quantity}× ${
                                      item.food?.name || "Unavailable item"
                                    }`,
                                )
                                .join(", ")}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">
                            {currencyFormatter.format(order.totalAmount)}
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
                                onChange={(event) => {
                                  void handleStatusChange(
                                    order._id,
                                    event.target.value as OrderStatus,
                                  );
                                }}
                                className="block w-full min-w-40 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {ORDER_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {formatStatus(status)}
                                  </option>
                                ))}
                              </select>

                              {isUpdating && (
                                <p
                                  role="status"
                                  className="text-xs text-gray-500"
                                >
                                  Updating…
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
