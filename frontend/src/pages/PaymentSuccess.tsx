import { Link, useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
          ✅
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Payment successful
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your payment was received. Your order will update
          to paid shortly.
        </p>

        {orderId && (
          <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Order ID:{' '}
            <span className="font-semibold">{orderId}</span>
          </p>
        )}

        <Link
          to="/orders"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          View my orders
        </Link>

        <Link
          to="/"
          className="mt-3 block text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Back to menu
        </Link>
      </section>
    </main>
  );
}