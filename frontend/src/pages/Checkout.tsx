import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import { createOrder } from "../api/order";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

import type { IOrderAddress } from "../types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const initialAddress: IOrderAddress = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  country: "",
};

type AddressField = keyof IOrderAddress;

type FieldErrors = Partial<Record<AddressField, string>>;

function validateAddress(address: IOrderAddress): FieldErrors {
  const errors: FieldErrors = {};

  if (!address.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (address.fullName.trim().length < 2) {
    errors.fullName = "Enter your full name.";
  }

  if (!address.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[+\d][\d\s()-]{6,19}$/.test(address.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!address.street.trim()) {
    errors.street = "Street address is required.";
  } else if (address.street.trim().length < 5) {
    errors.street = "Enter a complete street address.";
  }

  if (!address.city.trim()) {
    errors.city = "City is required.";
  }

  if (!address.country.trim()) {
    errors.country = "Country is required.";
  }

  return errors;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export default function Checkout() {
  const { user, loading } = useAuth();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState<IOrderAddress>(initialAddress);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateAddress =
    (field: AddressField) => (event: ChangeEvent<HTMLInputElement>) => {
      setAddress((currentAddress) => ({
        ...currentAddress,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (items.length === 0) {
      setFormError("Your cart is empty.");
      return;
    }

    const errors = validateAddress(address);
    setFieldErrors(errors);
    setFormError(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await createOrder({
        items: items.map((item) => ({
          foodId: item.food._id as string,
          quantity: item.quantity,
        })),
        address: {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          street: address.street.trim(),
          city: address.city.trim(),
          country: address.country.trim(),
        },
      });

      clearCart();

      navigate("/order-confirmation", {
        state: {
          orderId: response.data._id,
          totalAmount: response.data.totalAmount,
        },
        replace: true,
      });
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Unable to place your order."));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 disabled:opacity-60 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
    }`;

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
            Sign in to checkout
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            You need an account to place an order. Your cart will remain saved.
          </p>

          <Link
            to="/login"
            state={{ from: "/checkout" }}
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="mt-3 block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Create an account
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            FoodFlow
          </Link>

          <Link
            to="/cart"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to cart
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

        <p className="mt-2 text-sm text-slate-600">
          Review your order and enter your delivery details.
        </p>

        {items.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold">Your cart is empty</h2>

            <p className="mt-2 text-sm text-slate-500">
              Browse the menu and add something delicious.
            </p>

            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Browse menu
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-lg font-bold">Delivery details</h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fullName"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>

                  <input
                    id="fullName"
                    autoComplete="name"
                    value={address.fullName}
                    disabled={submitting}
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    aria-describedby={
                      fieldErrors.fullName ? "fullName-error" : undefined
                    }
                    onChange={updateAddress("fullName")}
                    className={inputClassName(Boolean(fieldErrors.fullName))}
                    placeholder="Jane Doe"
                  />

                  {fieldErrors.fullName && (
                    <p
                      id="fullName-error"
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Phone number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={address.phone}
                    disabled={submitting}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={
                      fieldErrors.phone ? "phone-error" : undefined
                    }
                    onChange={updateAddress("phone")}
                    className={inputClassName(Boolean(fieldErrors.phone))}
                    placeholder="+1 555 123 4567"
                  />

                  {fieldErrors.phone && (
                    <p
                      id="phone-error"
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="street"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Street address
                  </label>

                  <input
                    id="street"
                    autoComplete="street-address"
                    value={address.street}
                    disabled={submitting}
                    aria-invalid={Boolean(fieldErrors.street)}
                    aria-describedby={
                      fieldErrors.street ? "street-error" : undefined
                    }
                    onChange={updateAddress("street")}
                    className={inputClassName(Boolean(fieldErrors.street))}
                    placeholder="123 Main Street, Apt 4"
                  />

                  {fieldErrors.street && (
                    <p
                      id="street-error"
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {fieldErrors.street}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    autoComplete="address-level2"
                    value={address.city}
                    disabled={submitting}
                    aria-invalid={Boolean(fieldErrors.city)}
                    aria-describedby={
                      fieldErrors.city ? "city-error" : undefined
                    }
                    onChange={updateAddress("city")}
                    className={inputClassName(Boolean(fieldErrors.city))}
                    placeholder="New York"
                  />

                  {fieldErrors.city && (
                    <p
                      id="city-error"
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {fieldErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Country
                  </label>

                  <input
                    id="country"
                    autoComplete="country-name"
                    value={address.country}
                    disabled={submitting}
                    aria-invalid={Boolean(fieldErrors.country)}
                    aria-describedby={
                      fieldErrors.country ? "country-error" : undefined
                    }
                    onChange={updateAddress("country")}
                    className={inputClassName(Boolean(fieldErrors.country))}
                    placeholder="United States"
                  />

                  {fieldErrors.country && (
                    <p
                      id="country-error"
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {fieldErrors.country}
                    </p>
                  )}
                </div>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Placing order…"
                  : `Place order • ${currencyFormatter.format(totalPrice)}`}
              </button>
            </form>

            <aside
              aria-label="Order summary"
              className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-lg font-bold">Order summary</h2>

              <ul className="mt-5 space-y-4">
                {items.map(({ food, quantity }) => (
                  <li
                    key={food._id}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold">{food.name}</span>

                      <span className="text-slate-500">
                        Quantity: {quantity}
                      </span>
                    </span>

                    <span className="font-semibold">
                      {currencyFormatter.format(food.price * quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Total items</dt>

                  <dd className="font-semibold">{totalItems}</dd>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <dt className="font-semibold">Order total</dt>

                  <dd className="text-lg font-bold text-indigo-600">
                    {currencyFormatter.format(totalPrice)}
                  </dd>
                </div>
              </dl>

              <p className="mt-5 text-xs leading-5 text-slate-500">
                Your order will be created with a pending payment status. You
                can update it after payment is added.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
