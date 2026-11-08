import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { getMyOrders } from '../api/order';
import { createCheckoutSession } from '../api/payments';
import { getFoodImageUrl } from '../api/food';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, formatDate } from '../utils/format';
import OrderStatusBadge from '../components/OrderStatusBadge';
import PaymentStatusBadge from '../components/PaymentStatusBadge';

import type { IPopulatedOrder } from '../types';

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      fallback
    );
  }

  return error instanceof Error ? error.message : fallback;
}

export default function MyOrders() {
  const { user, loading } = useAuth();

  const [orders, setOrders] = useState<IPopulatedOrder[]>(
    []
  );
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [payingOrderId, setPayingOrderId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const controller = new AbortController();
    let pollInProgress = false;

    const loadOrders = async () => {
      try {
        const response = await getMyOrders(
          controller.signal
        );

        if (!controller.signal.aborted) {
          setOrders(response.data);
          setError(null);
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(
            getErrorMessage(
              err,
              'Unable to load your orders.'
            )
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingOrders(false);
        }
      }
    };

    void loadOrders();

    const intervalId = window.setInterval(() => {
      if (
        document.visibilityState !== 'visible' ||
        pollInProgress
      ) {
        return;
      }

      pollInProgress = true;
      void loadOrders().finally(() => {
        pollInProgress = false;
      });
    }, 10_000);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [user, retryCount]);

  const handlePayNow = async (orderId: string) => {
    setPayingOrderId(orderId);

    try {
      const response = await createCheckoutSession(
        orderId
      );

      window.location.assign(response.data.checkoutUrl);
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(
          err,
          'Unable to start payment. Please try again.'
        )
      );
    } finally {
      setPayingOrderId(null);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-sm text-slate-500">
          Checking your session…
        </p>
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
            Your order history is available after signing
            in.
          </p>

          <Link
            to="/login"
            state={{ from: '/orders' }}
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
          <Link
            to="/"
            className="text-xl font-bold text-indigo-600"
          >
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
        <h1 className="text-3xl font-bold tracking-tight">
          My orders
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Track your orders and complete pending payments.
        </p>

        {error && orders.length > 0 && (
          <p
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error} We’ll retry automatically.
          </p>
        )}

        {loadingOrders ? (
          <div
            role="status"
            className="mt-8 rounded-3xl border border-slate-200 bg-white p-16 text-center text-sm text-slate-500"
          >
            Loading your orders…
          </div>
        ) : error && orders.length === 0 ? (
          <div
            role="alert"
            className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-center"
          >
            <p className="text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={() =>
                {
                  setLoadingOrders(true);
                  setError(null);
                  setRetryCount((current) => current + 1);
                }
              }
              className="mt-5 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold">
              No orders yet
            </h2>

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
                      Order #
                      {order._id
                        .slice(-8)
                        .toUpperCase()}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </div>

                <div className="px-5 py-5 sm:px-6">
                  <ul className="space-y-4">
                    {order.items.map(
                      (item, index) => (
                        <li
                          key={`${order._id}-${item.food?._id ?? index}`}
                          className="flex items-center gap-4"
                        >
                          <img
                            src={getFoodImageUrl(
                              item.foodImage || item.food?.image || ''
                            )}
                            alt={item.foodName || item.food?.name || 'Unavailable item'}
                            loading="lazy"
                            className="h-16 w-16 rounded-xl bg-slate-100 object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold">
                              {item.foodName || item.food?.name || 'Unavailable item'}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Quantity:{' '}
                              {item.quantity} •{' '}
                              {formatCurrency(
                                item.unitPrice
                              )}{' '}
                              each
                            </p>
                          </div>

                          <p className="text-sm font-semibold">
                            {formatCurrency(
                              item.subtotal
                            )}
                          </p>
                        </li>
                      )
                    )}
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
                        {order.address.city},{' '}
                        {order.address.country}
                        <br />
                        {order.address.phone}
                      </address>
                    </div>

                    <div className="sm:text-right">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Order total
                      </h3>

                      <p className="mt-2 text-2xl font-bold text-indigo-600">
                        {formatCurrency(
                          order.totalAmount
                        )}
                      </p>

                      {order.paymentStatus !== 'paid' &&
                        order.paymentMethod !== 'cod' &&
                        order.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() =>
                            handlePayNow(order._id)
                          }
                          disabled={
                            payingOrderId ===
                            order._id
                          }
                          className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          {payingOrderId ===
                          order._id
                            ? 'Starting payment…'
                            : 'Pay now'}
                        </button>
                      )}
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