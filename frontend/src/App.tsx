import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";

import AdminRoute from "./components/AdminRoute";
import RequireAuth from "./components/RequireAuth";
import AdminLayout from "./layouts/AdminLayout";

// Customer storefront pages (code-split)
const Menu = lazy(() => import("./pages/Menu"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));

// Admin back-office pages (code-split, isolates heavy charting dependencies)
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const Food = lazy(() => import("./pages/admin/Food"));

export function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-[60vh] items-center justify-center p-6"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  );
}

function AccessDenied() {
  const { logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Admin access required
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          Your account does not have permission to access the administration
          panel.
        </p>

        <button
          type="button"
          onClick={logout}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Sign out
        </button>
      </section>
    </main>
  );
}

function AccessDeniedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <p role="status" className="text-sm text-slate-500">
          Checking your session…
        </p>
      </main>
    );
  }

  return user ? <AccessDenied /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Menu />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route element={<RequireAuth />}>
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route
                path="/order-confirmation"
                element={<OrderConfirmation />}
              />
            </Route>

            <Route path="/access-denied" element={<AccessDeniedRoute />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />

                <Route path="dashboard" element={<Dashboard />} />

                <Route path="orders" element={<Orders />} />

                <Route path="food" element={<Food />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
