import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { registerUser } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

type FieldErrors = Partial<
  Record<"name" | "email" | "password" | "confirmPassword", string>
>;

function validateRegister(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!name.trim()) {
    errors.name = "Full name is required.";
  } else if (name.trim().length < 2) {
    errors.name = "Enter your full name.";
  }

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = "Include at least one letter and one number.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function Register() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-sm text-slate-500">Checking your session…</p>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateRegister(name, email, password, confirmPassword);

    setFieldErrors(errors);
    setFormError(null);

    if (Object.keys(errors).length > 0 || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const registeredUser = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      await login({
        email: email.trim(),
        password,
      });

      navigate(
        registeredUser.user.role === "admin" ? "/admin/dashboard" : "/",
        { replace: true },
      );
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setFormError(
          err.response?.data?.message ||
            "Unable to create your account. Please try again.",
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
              Create your account
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-indigo-200">
              Order your favorite meals, save your delivery details, and track
              your orders.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5">
            <p className="text-sm font-semibold">Join FoodFlow today</p>

            <p className="mt-2 text-xs leading-5 text-indigo-200">
              Discover food from every category and order in minutes.
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
              Create account
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Sign up to start ordering.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  disabled={submitting}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClassName(Boolean(fieldErrors.name))}
                  placeholder="Jane Doe"
                />

                {fieldErrors.name && (
                  <p
                    id="name-error"
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
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
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    disabled={submitting}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? "password-error" : "password-hint"
                    }
                    onChange={(event) => setPassword(event.target.value)}
                    className={`${inputClassName(
                      Boolean(fieldErrors.password),
                    )} pr-20`}
                    placeholder="Create a password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {fieldErrors.password ? (
                  <p
                    id="password-error"
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.password}
                  </p>
                ) : (
                  <p
                    id="password-hint"
                    className="mt-1.5 text-xs text-slate-500"
                  >
                    At least 8 characters, with one letter and one number.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    disabled={submitting}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    aria-describedby={
                      fieldErrors.confirmPassword
                        ? "confirm-password-error"
                        : undefined
                    }
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={`${inputClassName(
                      Boolean(fieldErrors.confirmPassword),
                    )} pr-20`}
                    placeholder="Re-enter your password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {fieldErrors.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.confirmPassword}
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
                {submitting ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Sign in
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
