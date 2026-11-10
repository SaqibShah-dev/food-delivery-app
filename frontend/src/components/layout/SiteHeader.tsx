import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

function NavLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
        isActive
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      } ${focusRing}`}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMobileMenu}
          className={`flex items-center gap-2 text-xl font-extrabold tracking-tight text-indigo-600 ${focusRing}`}
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 3h16v6a8 8 0 0 1-16 0V3Z" />
              <path d="M12 17v4M8 21h8" />
            </svg>
          </span>

          FoodFlow
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          <NavLink to="/">Menu</NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin/dashboard">
              Admin panel
            </NavLink>
          )}

          {user && <NavLink to="/orders">My orders</NavLink>}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            aria-label={
              totalItems > 0
                ? `Cart, ${totalItems} items`
                : "Cart, empty"
            }
            className={`relative inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${focusRing}`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
              <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 2-1.5L21 7H6" />
            </svg>

            <span className="hidden sm:inline">Cart</span>

            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="max-w-32 truncate text-sm font-medium text-slate-600">
                {user.name}
              </span>

              <button
                type="button"
                onClick={logout}
                className={`rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${focusRing}`}
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`hidden rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 md:inline-flex ${focusRing}`}
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() =>
              setIsMobileMenuOpen((isOpen) => !isOpen)
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label="Toggle navigation menu"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition-colors hover:bg-slate-50 md:hidden ${focusRing}`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMobileMenuOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-slate-200 bg-white transition-[max-height] duration-300 md:hidden ${
          isMobileMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav
          aria-label="Mobile"
          className="flex flex-col gap-1 px-4 py-4"
        >
          <NavLink to="/" onClick={closeMobileMenu}>
            Menu
          </NavLink>

          {user?.role === "admin" && (
            <NavLink
              to="/admin/dashboard"
              onClick={closeMobileMenu}
            >
              Admin panel
            </NavLink>
          )}

          {user && (
            <NavLink to="/orders" onClick={closeMobileMenu}>
              My orders
            </NavLink>
          )}

          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                closeMobileMenu();
              }}
              className={`rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 ${focusRing}`}
            >
              Log out
            </button>
          ) : (
            <NavLink to="/login" onClick={closeMobileMenu}>
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}