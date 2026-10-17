import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";

import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Food from "./pages/admin/Food";

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
  const { user } = useAuth();

  return user ? <AccessDenied /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />

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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
