import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { createOrder } from '../api/order';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

import type { IOrderAddress } from '../types';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const initialAddress: IOrderAddress = {
  fullName: '',
  phone: '',
  street: '',
  city: '',
  country: '',
};

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

export default function Checkout() {
  const { user } = useAuth();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] =
    useState<IOrderAddress>(initialAddress);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAddress =
    (field: keyof IOrderAddress) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) => {
      setAddress((currentAddress) => ({
        ...currentAddress,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await createOrder({
        items: items.map((item) => ({
          foodId: item.food._id as string,
          quantity: item.quantity,
        })),
        address,
      });

      clearCart();

      navigate('/order-confirmation', {
        state: {
          orderId: response.data._id,
          totalAmount: response.data.totalAmount,
        },
        replace: true,
      });
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, 'Unable to place your order.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">
            Sign in to checkout
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            You need an account to place an order.
          </p>

          <Link
            to="/login"
            state={{ from: '/checkout' }}
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="text-xl font-bold text-indigo-600"
          >
            FoodFlow
          </Link>

          <Link
            to="/cart"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Back to cart
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Checkout
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Review your order and enter your delivery details.
        </p>

        {items.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold">
              Your cart is empty
            </h2>

            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Browse menu
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h2 className="text-lg font-bold">
                Delivery details
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Full name
                  </span>

                  <input
                    required
                    value={address.fullName}
                    onChange={updateAddress('fullName')}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Phone number
                  </span>

                  <input
                    required
                    type="tel"
                    value={address.phone}
                    onChange={updateAddress('phone')}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Street address
                  </span>

                  <input
                    required
                    value={address.street}
                    onChange={updateAddress('street')}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    City
                  </span>

                  <input
                    required
                    value={address.city}
                    onChange={updateAddress('city')}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Country
                  </span>

                  <input
                    required
                    value={address.country}
                    onChange={updateAddress('country')}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                  />
                </label>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? 'Placing order…'
                  : `Place order • ${currencyFormatter.format(
                      totalPrice
                    )}`}
              </button>
            </form>

            <aside
              aria-label="Order summary"
              className="h-fit rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h2 className="text-lg font-bold">
                Order summary
              </h2>

              <ul className="mt-5 space-y-4">
                {items.map(({ food, quantity }) => (
                  <li
                    key={food._id}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold">
                        {food.name}
                      </span>

                      <span className="text-slate-500">
                        Quantity: {quantity}
                      </span>
                    </span>

                    <span className="font-semibold">
                      {currencyFormatter.format(
                        food.price * quantity
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">
                    Total items
                  </dt>

                  <dd className="font-semibold">
                    {totalItems}
                  </dd>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <dt className="font-semibold">Total</dt>

                  <dd className="text-lg font-bold text-indigo-600">
                    {currencyFormatter.format(totalPrice)}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}