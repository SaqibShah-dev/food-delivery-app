import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type NavItemProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  onNavigate?: () => void;
};

function NavItem({ to, label, icon, onNavigate }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
          isActive
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-300 hover:bg-slate-800 hover:text-white",
        ].join(" ")
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 2h9l3 3v17H6z" />
      <path d="M14 2v4h4" />
      <path d="M9 11h6M9 15h6M9 19h4" />
    </svg>
  );
}

function FoodIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M8 3v8M5 3v5a3 3 0 0 0 6 0V3M8 11v10" />
      <path d="M16 3v18M16 3c3 1 3 7 0 8" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  // Keep the rest of your layout here.
  const navigation = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
        <div>
          <p className="text-lg font-bold tracking-tight text-white">
            FoodFlow
          </p>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>

        <button
          type="button"
          onClick={closeSidebar}
          className="rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="space-y-1 px-3 py-5" aria-label="Admin navigation">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Management
        </p>

        <NavItem
          to="/admin/dashboard"
          label="Dashboard"
          icon={<DashboardIcon />}
          onNavigate={closeSidebar}
        />

        <NavItem
          to="/admin/orders"
          label="Orders"
          icon={<OrdersIcon />}
          onNavigate={closeSidebar}
        />

        <NavItem
          to="/admin/food"
          label="Food menu"
          icon={<FoodIcon />}
          onNavigate={closeSidebar}
        />
      </nav>

      <div className="mt-auto border-t border-slate-800 p-4">
        <div className="rounded-lg bg-slate-800/70 p-3">
          <p className="text-sm font-medium text-white">Administrator</p>
          <p className="mt-1 text-xs text-slate-400">
            Manage food and customer orders
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-900 shadow-xl transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {navigation}
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>

          <div className="hidden lg:block">
            <div className="rounded-lg bg-slate-800/70 p-3">
              <p className="text-sm font-medium text-white">Administrator</p>
              <p className="mt-1 text-xs text-slate-400">
                Manage food and customer orders
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Log out
          </button>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
