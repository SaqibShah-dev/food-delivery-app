import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const routeState = location.state as {
    from?: string;
  } | null;

  const requestedPath = routeState?.from;

  const destination =
    typeof requestedPath === "string" && requestedPath.startsWith("/admin/")
      ? requestedPath
      : "/admin/dashboard";

  if (user) {
    return (
      <Navigate
        to={user.role === "admin" ? destination : "/access-denied"}
        replace
      />
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const loggedInUser = await login({
        email: email.trim(),
        password,
      });

      navigate(loggedInUser.role === "admin" ? destination : "/access-denied", {
        replace: true,
      });
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message || "Unable to log in. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">FoodFlow</p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Sign in to manage your menu and customer orders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Email address
            </span>

            <input
              required
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              disabled={submitting}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </span>

            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              disabled={submitting}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
