import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

type FieldErrors = Partial<Record<"email" | "password", string>>;

function validateLogin(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const routeState = location.state as { from?: string } | null;
  const requestedPath = routeState?.from;

  const adminDestination =
    typeof requestedPath === "string" && requestedPath.startsWith("/admin/")
      ? requestedPath
      : "/admin/dashboard";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-sm text-slate-500">Checking your session…</p>
      </main>
    );
  }

  if (user) {
    return (
      <Navigate to={user.role === "admin" ? adminDestination : "/"} replace />
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateLogin(email, password);
    setFieldErrors(errors);
    setFormError(null);

    if (Object.keys(errors).length > 0 || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const loggedInUser = await login({
        email: email.trim(),
        password,
      });

      navigate(loggedInUser.role === "admin" ? adminDestination : "/", {
        replace: true,
      });
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setFormError(
          err.response?.data?.message ||
            "Unable to log in. Please check your details and try again.",
        );
      } else {
        setFormError("Something went wrong. Please try again.");
      }
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 sm:py-16">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 lg:grid lg:grid-cols-2">
        {/* Brand panel */}
        <section className="hidden flex-col justify-between bg-indigo-950 p-10 text-white lg:flex">
          <div>
            <Link to="/" className="text-xl font-bold">
              FoodFlow
            </Link>

            <h2 className="mt-16 text-3xl font-bold leading-tight">
              Welcome back to
              <br />
              delicious convenience.
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-indigo-200">
              Sign in to browse the menu, manage your cart, and place orders.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5">
            <p className="text-sm font-semibold">Fresh food. Fast delivery.</p>

            <p className="mt-2 text-xs leading-5 text-indigo-200">
              Your favorite meals are only a few taps away.
            </p>
          </div>
        </section>

        {/* Form panel */}
        <section className="p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <Link
              to="/"
              className="text-lg font-bold text-indigo-600 lg:hidden"
            >
              FoodFlow
            </Link>

            <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl lg:mt-0">
              Sign in
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Use your email and password to continue.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  disabled={submitting}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "email-error" : undefined
                  }
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClassName(Boolean(fieldErrors.email))}
                  placeholder="you@example.com"
                />

                {fieldErrors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    disabled={submitting}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? "password-error" : undefined
                    }
                    onChange={(event) => setPassword(event.target.value)}
                    className={`${inputClassName(
                      Boolean(fieldErrors.password),
                    )} pr-20`}
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {fieldErrors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {formError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              New to FoodFlow?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Create an account
              </Link>
            </p>

            <Link
              to="/"
              className="mt-4 block text-center text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Back to menu
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
