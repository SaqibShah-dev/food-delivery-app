import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

export function SiteFooter() {
  const { user } = useAuth();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Link
            to="/"
            className={`inline-flex text-lg font-extrabold text-indigo-600 ${focusRing}`}
          >
            FoodFlow
          </Link>

          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
            Explore something delicious. Order your favorite meals
            with a simple, reliable checkout experience.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
            Explore
          </h2>

          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>
              <Link
                to="/"
                className={`transition-colors hover:text-indigo-600 ${focusRing}`}
              >
                Menu
              </Link>
            </li>

            <li>
              <Link
                to="/cart"
                className={`transition-colors hover:text-indigo-600 ${focusRing}`}
              >
                Cart
              </Link>
            </li>

            {user && (
              <li>
                <Link
                  to="/orders"
                  className={`transition-colors hover:text-indigo-600 ${focusRing}`}
                >
                  My orders
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
            Support
          </h2>

          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>
              <a
                href="mailto:support@foodflow.example"
                className={`transition-colors hover:text-indigo-600 ${focusRing}`}
              >
                support@foodflow.example
              </a>
            </li>

            <li>Mon–Sun, 10:00 AM–11:00 PM</li>
            <li>Delivery available in selected areas</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
            Payments
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Secure checkout powered by Stripe. Your payment details
            are handled by Stripe and are not stored on FoodFlow.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} FoodFlow. All rights
            reserved.
          </p>

          <p>Explore something delicious.</p>
        </div>
      </div>
    </footer>
  );
}