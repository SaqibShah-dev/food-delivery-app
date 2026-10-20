import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { getMyOrders } from "../api/order";
import { getFoodImageUrl } from "../api/food";
import { useAuth } from "../hooks/useAuth";

import type { IPopulatedOrder } from "../types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  preparing: "bg-purple-50 text-purple-700 ring-purple-200",
  "out-for-delivery": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

function formatStatus(status: string) {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export default function MyOrders() {
  const { user, loading } = useAuth();

  const [orders, setOrders] = useState<IPopulatedOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoadingOrders(false);
      return;
    }

    const controller = new AbortController();

    const loadOrders = async () => {
      setLoadingOrders(true);
      setError(null);

      try {
        const response = await getMyOrders(controller.signal);

        if (!controller.signal.aborted) {
          setOrders(response.data);
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(err, "Unable to load your orders."));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingOrders(false);
        }
      }
    };

    void loadOrders();

    return () => {
      controller.abort();
    };
  }, [user, retryCount]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-sm text-slate-500">Checking your session…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
        <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">
            Sign in to view orders
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Your order history is available after signing in.
          </p>

          <Link
            to="/login"
            state={{ from: "/orders" }}
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            FoodFlow
          </Link>

          <Link
            to="/"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Browse menu
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight">My orders</h1>

        <p className="mt-2 text-sm text-slate-600">
          Track your recent FoodFlow orders.
        </p>

        {loadingOrders ? (
          <div
            role="status"
            className="mt-8 rounded-3xl border border-slate-200 bg-white p-16 text-center text-sm text-slate-500"
          >
            Loading your orders…
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-center"
          >
            <p className="text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setRetryCount((current) => current + 1)}
              className="mt-5 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold">No orders yet</h2>

            <p className="mt-2 text-sm text-slate-500">
              When you place an order, it will appear here.
            </p>

            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Browse menu
            </Link>
          </section>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => (
              <article
                key={order._id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {dateFormatter.format(new Date(order.createdAt))}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                        statusStyles[order.status] ||
                        "bg-slate-100 text-slate-700 ring-slate-200"
                      }`}
                    >
                      {formatStatus(order.status)}
                    </span>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                        order.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200"
                      }`}
                    >
                      {formatStatus(order.paymentStatus)}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-5 sm:px-6">
                  <ul className="space-y-4">
                    {order.items.map((item, index) => (
                      <li
                        key={`${order._id}-${item.food._id}-${index}`}
                        className="flex items-center gap-4"
                      >
                        <img
                          src={getFoodImageUrl(item.food.image)}
                          alt={item.food.name}
                          loading="lazy"
                          className="h-16 w-16 rounded-xl bg-slate-100 object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{item.food.name}</p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Quantity: {item.quantity} •{" "}
                            {currencyFormatter.format(item.unitPrice)} each
                          </p>
                        </div>

                        <p className="text-sm font-semibold">
                          {currencyFormatter.format(item.subtotal)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Delivery address
                      </h3>

                      <address className="mt-2 text-sm not-italic leading-6 text-slate-700">
                        {order.address.fullName}
                        <br />
                        {order.address.street}
                        <br />
                        {order.address.city}, {order.address.country}
                        <br />
                        {order.address.phone}
                      </address>
                    </div>

                    <div className="sm:text-right">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Order total
                      </h3>

                      <p className="mt-2 text-2xl font-bold text-indigo-600">
                        {currencyFormatter.format(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
