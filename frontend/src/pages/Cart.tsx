import { Link } from "react-router-dom";

import { useCart } from "../hooks/useCart";
import { getFoodImageUrl } from "../api/food";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Cart() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            FoodFlow
          </Link>

          <Link
            to="/"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Continue shopping
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>

        <p className="mt-2 text-sm text-slate-600">
          {totalItems} {totalItems === 1 ? "item" : "items"} in your cart.
        </p>

        {items.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold">Your cart is empty</h2>

            <p className="mt-2 text-sm text-slate-500">
              Browse the menu and add something delicious.
            </p>

            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Browse menu
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <section aria-label="Cart items" className="space-y-4">
              {items.map(({ food, quantity }) => (
                <article
                  key={food._id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row"
                >
                  <img
                    src={getFoodImageUrl(food.image)}
                    alt={food.name}
                    loading="lazy"
                    className="h-28 w-full rounded-xl bg-slate-100 object-cover sm:w-36"
                  />

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold">{food.name}</h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {currencyFormatter.format(food.price)} each
                        </p>
                      </div>

                      <p className="font-semibold">
                        {currencyFormatter.format(food.price * quantity)}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                      <div className="flex items-center rounded-lg border border-slate-300">
                        <button
                          type="button"
                          aria-label={`Decrease ${food.name} quantity`}
                          onClick={() => updateQuantity(food._id, quantity - 1)}
                          className="px-3 py-2 text-lg font-semibold hover:bg-slate-100"
                        >
                          −
                        </button>

                        <span
                          aria-live="polite"
                          className="min-w-10 px-2 text-center text-sm font-semibold"
                        >
                          {quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase ${food.name} quantity`}
                          onClick={() => updateQuantity(food._id, quantity + 1)}
                          className="px-3 py-2 text-lg font-semibold hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(food._id)}
                        className="text-sm font-semibold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              <button
                type="button"
                onClick={clearCart}
                className="self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
              >
                Clear cart
              </button>
            </section>

            <aside
              aria-label="Order summary"
              className="h-fit rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h2 className="text-lg font-bold">Order summary</h2>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Items</dt>

                  <dd className="font-semibold">{totalItems}</dd>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <dt className="font-semibold">Total</dt>

                  <dd className="text-lg font-bold text-indigo-600">
                    {currencyFormatter.format(totalPrice)}
                  </dd>
                </div>
              </dl>

              <Link
                to="/checkout"
                className="mt-6 block w-full rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Proceed to checkout
              </Link>

              <p className="mt-3 text-center text-xs text-slate-500">
                You’ll sign in before placing your order.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
