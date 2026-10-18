import { Link, useLocation } from "react-router-dom";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function OrderConfirmation() {
  const location = useLocation();

  const routeState = location.state as {
    orderId?: string;
    totalAmount?: number;
  } | null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
          ✅
        </div>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">Order placed</h1>

        <p className="mt-3 text-sm text-slate-600">
          Thank you. Your order has been received and is now pending
          confirmation.
        </p>

        {routeState?.orderId && (
          <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Order ID:{" "}
            <span className="font-semibold">{routeState.orderId}</span>
          </p>
        )}

        {typeof routeState?.totalAmount === "number" && (
          <p className="mt-3 text-sm text-slate-600">
            Total:{" "}
            <span className="font-semibold">
              {currencyFormatter.format(routeState.totalAmount)}
            </span>
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Continue shopping
          </Link>

          <Link
            to="/orders"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            View my orders
          </Link>
        </div>
      </section>
    </main>
  );
}
