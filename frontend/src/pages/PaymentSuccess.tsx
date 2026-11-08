import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { confirmCheckoutSession } from '../api/payments';
import { useAuth } from '../hooks/useAuth';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let active = true;

    const verifyPayment = async () => {
      try {
        if (!user) {
          throw new Error('Sign in to verify this payment.');
        }

        if (!sessionId) {
          throw new Error(
            'The Stripe checkout session is missing. Please check your orders.'
          );
        }

        await confirmCheckoutSession(sessionId);

        if (active) {
          setError(null);
          toast.success('Payment confirmed.');
          setChecking(false);
        }
      } catch (err: unknown) {
        if (active) {
          if (axios.isAxiosError<{ message?: string }>(err)) {
            const message =
              err.response?.data?.message ||
              'Unable to verify payment with the server.';
            setError(message);
            toast.error(message);
          } else {
            const message =
              err instanceof Error
                ? err.message
                : 'Unable to verify payment with the server.';
            setError(message);
            toast.error(message);
          }

          setChecking(false);
        }
      }
    };

    void Promise.resolve().then(verifyPayment);

    return () => {
      active = false;
    };
  }, [authLoading, sessionId, user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            error
              ? 'bg-amber-100'
              : 'bg-emerald-100'
          }`}
        >
          {checking ? '…' : error ? '!' : '✅'}
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          {checking
            ? 'Verifying payment'
            : error
              ? 'Payment not verified'
              : 'Payment successful'}
        </h1>

        <p
          role={error ? 'alert' : 'status'}
          className="mt-3 text-sm leading-6 text-slate-600"
        >
          {checking
            ? 'Confirming your payment with Stripe…'
            : error
              ? error
              : 'Your payment is confirmed and your order is marked paid.'}
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
          {error ? 'Check my orders' : 'View my orders'}
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