import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AddToCartButton from "../components/AddToCartButton";
import { useCart } from "../hooks/useCart";
import {
  getAvailableFoodCategories,
  getAvailableFoodItems,
  getFoodImageUrl,
} from "../api/food";
import { useAuth } from "../hooks/useAuth";
import type { IFoodItem, IFoodMenuFilters, IPagination } from "../types";

const PAGE_SIZE = 9;
const SEARCH_DEBOUNCE_MS = 400;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Inline fallback so a broken image never shows the browser's broken icon.
const IMAGE_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="#e2e8f0"/><text x="8" y="5" font-size="1.2" text-anchor="middle" fill="#64748b" font-family="sans-serif">No image</text></svg>`,
  );

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

/** Builds a compact page list like [1, "…", 4, 5, 6, "…", 12]. */
function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("…");
    result.push(p);
  });
  return result;
}

/* ------------------------------------------------------------------ */
/* Small presentational components                                     */
/* ------------------------------------------------------------------ */

function SiteHeader() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className={`rounded text-xl font-bold tracking-tight text-indigo-600 ${focusRing}`}
        >
          FoodFlow
        </Link>

        <nav
          aria-label="Customer navigation"
          className="flex items-center gap-2 sm:gap-4"
        >
          {user?.role === "admin" && (
            <Link
              to="/admin/dashboard"
              className={`hidden rounded px-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 sm:inline ${focusRing}`}
            >
              Admin panel
            </Link>
          )}

          {user && (
            <Link
              to="/orders"
              className={`rounded px-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 ${focusRing}`}
            >
              My orders
            </Link>
          )}

          <Link
            to="/cart"
            aria-label={
              totalItems > 0 ? `Cart, ${totalItems} items` : "Cart, empty"
            }
            className={`relative inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${focusRing}`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
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
            Cart
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 lg:inline">
                Hello, {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className={`rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${focusRing}`}
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 ${focusRing}`}
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function FoodCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <div className="aspect-video w-full animate-pulse bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="flex items-center justify-between pt-3">
          <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

function FoodCard({ item }: { item: IFoodItem }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <img
        src={getFoodImageUrl(item.image)}
        alt={item.name}
        loading="lazy"
        width={640}
        height={360}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = IMAGE_FALLBACK;
        }}
        className="aspect-video w-full bg-slate-100 object-cover"
      />

      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex w-fit rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
          {item.category}
        </span>

        <h3 className="mt-3 text-lg font-bold">{item.name}</h3>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
          {item.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xl font-bold text-indigo-600">
            {currencyFormatter.format(item.price)}
          </p>
          <AddToCartButton food={item} className="w-auto min-w-36" />
        </div>
      </div>
    </article>
  );
}

function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: IPagination;
  onPageChange: (page: number) => void;
}) {
  const pages = getPageNumbers(pagination.page, pagination.totalPages);
  const btn = `rounded-lg border px-3 py-2 text-sm font-semibold ${focusRing}`;

  return (
    <nav
      aria-label="Menu pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        disabled={!pagination.hasPreviousPage}
        onClick={() => onPageChange(pagination.page - 1)}
        className={`${btn} border-slate-300 bg-white hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Previous
      </button>

      {/* Full page list on larger screens, "Page X of Y" on mobile */}
      <p aria-live="polite" className="px-2 text-sm text-slate-600 sm:hidden">
        Page {pagination.page} of {pagination.totalPages}
      </p>

      <ul className="hidden items-center gap-1 sm:flex">
        {pages.map((p, index) =>
          p === "…" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-2 text-slate-400">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                aria-label={`Page ${p}`}
                aria-current={p === pagination.page ? "page" : undefined}
                onClick={() => onPageChange(p)}
                className={`${btn} min-w-10 ${
                  p === pagination.page
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.page + 1)}
        className={`${btn} border-slate-300 bg-white hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Next
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Menu() {
  const [items, setItems] = useState<IFoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);
  const [categoryRetry, setCategoryRetry] = useState(0);

  const resultsRef = useRef<HTMLElement>(null);

  // Categories load independently, so a category error does
  // not prevent customers from browsing the food list.
  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoryError(null);

      try {
        const response = await getAvailableFoodCategories(controller.signal);
        if (!controller.signal.aborted) setCategories(response.data);
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setCategoryError(getErrorMessage(err, "Unable to load categories."));
        }
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      }
    };

    void loadCategories();
    return () => controller.abort();
  }, [categoryRetry]);

  // Search as the customer types (debounced). Pressing Enter applies it immediately.
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search) return;

    const timer = window.setTimeout(() => {
      setSearch(trimmed);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput, search]);

  // Reload the menu when applied filters or the page change.
  useEffect(() => {
    const controller = new AbortController();

    const loadMenu = async () => {
      setLoading(true);
      setError(null);

      const filters: IFoodMenuFilters = { page, limit: PAGE_SIZE };
      if (category) filters.category = category;
      if (search) filters.search = search;

      try {
        const response = await getAvailableFoodItems(filters, controller.signal);
        if (controller.signal.aborted) return;

        setItems(response.data.items);
        setPagination(response.data.pagination);
        setHasLoadedOnce(true);
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(err, "Unable to load the menu."));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadMenu();
    return () => controller.abort();
  }, [page, category, search, retryCount]);

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage);
    // Bring the top of the results into view after paging.
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setPage(1);
  };

  const hasFilters = Boolean(search || category);
  const isInitialLoad = loading && !hasLoadedOnce;
  // Keep showing the previous results (dimmed) while a new page loads, to avoid layout jumps.
  const isRefreshing = loading && hasLoadedOnce;

  const resultSummary = useMemo(() => {
    if (!pagination) return "";
    const count = pagination.totalItems;
    return `${count} ${count === 1 ? "item" : "items"}${
      search ? ` matching “${search}”` : ""
    }`;
  }, [pagination, search]);

  const chipBase = `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${focusRing}`;
  const chipActive = "bg-indigo-600 text-white";
  const chipIdle =
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#menu-results"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to menu
      </a>

      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Introduction: compact so the food is visible sooner */}
        <section className="mb-6 rounded-2xl bg-indigo-950 px-6 py-8 text-white sm:px-10 sm:py-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Find your next favorite meal
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100">
            Search for a dish or browse by category, then add it to your cart.
          </p>

          {/* Search lives inside the hero so it is the first thing people can act on */}
          <form
            onSubmit={handleSearch}
            role="search"
            className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="menu-search" className="sr-only">
              Search food by name
            </label>

            <div className="relative min-w-0 flex-1">
              <input
                id="menu-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search pizza, chicken, drinks..."
                autoComplete="off"
                className="w-full rounded-xl border border-transparent bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-300 [&::-webkit-search-cancel-button]:hidden"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className={`absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 ${focusRing}`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <button
              type="submit"
              className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
            >
              Search
            </button>
          </form>
        </section>

        {/* Category filters: one scrolling row on mobile, wrapping on desktop */}
        <section aria-label="Filter menu by category" className="mb-6">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            <button
              type="button"
              aria-pressed={category === ""}
              onClick={() => handleCategoryChange("")}
              className={`${chipBase} ${category === "" ? chipActive : chipIdle}`}
            >
              All food
            </button>

            {categoriesLoading &&
              Array.from({ length: 4 }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-slate-200"
                />
              ))}

            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => handleCategoryChange(item)}
                className={`${chipBase} ${category === item ? chipActive : chipIdle}`}
              >
                {item}
              </button>
            ))}
          </div>

          {categoryError && (
            <p role="status" className="mt-3 text-sm text-amber-700">
              Categories could not be loaded. You can still search the menu.{" "}
              <button
                type="button"
                onClick={() => setCategoryRetry((n) => n + 1)}
                className={`rounded font-semibold underline ${focusRing}`}
              >
                Retry
              </button>
            </p>
          )}
        </section>

        {/* Results */}
        <section
          id="menu-results"
          ref={resultsRef}
          aria-labelledby="menu-heading"
          className="scroll-mt-20"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 id="menu-heading" className="text-2xl font-bold tracking-tight">
              {category || "Our menu"}
            </h2>

            {/* Announced to screen readers whenever results change */}
            <p role="status" aria-live="polite" className="text-sm text-slate-500">
              {!loading && !error ? resultSummary : ""}
            </p>
          </div>

          {/* Applied filters, each removable on its own */}
          {hasFilters && (
            <ul className="mb-5 flex flex-wrap items-center gap-2" aria-label="Applied filters">
              {category && (
                <li>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("")}
                    className={`inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 ${focusRing}`}
                  >
                    Category: {category}
                    <span aria-hidden="true">×</span>
                    <span className="sr-only">Remove category filter</span>
                  </button>
                </li>
              )}
              {search && (
                <li>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className={`inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 ${focusRing}`}
                  >
                    Search: {search}
                    <span aria-hidden="true">×</span>
                    <span className="sr-only">Remove search filter</span>
                  </button>
                </li>
              )}
              {category && search && (
                <li>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className={`rounded px-1 text-xs font-semibold text-slate-600 underline hover:text-slate-900 ${focusRing}`}
                  >
                    Clear all
                  </button>
                </li>
              )}
            </ul>
          )}

          {isInitialLoad ? (
            <div
              aria-busy="true"
              aria-label="Loading menu"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {Array.from({ length: PAGE_SIZE }, (_, i) => (
                <FoodCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
            >
              <h3 className="text-base font-semibold text-red-800">
                We couldn’t load the menu
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => setRetryCount((n) => n + 1)}
                className={`mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 ${focusRing}`}
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
              <h3 className="text-lg font-semibold">No food found</h3>
              <p className="mt-2 text-sm text-slate-500">
                {hasFilters
                  ? "Try a different search or remove a filter."
                  : "There’s nothing on the menu right now. Check back soon."}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className={`rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 ${focusRing}`}
                  >
                    Show all food
                  </button>
                )}
                {page > 1 && (
                  <button
                    type="button"
                    onClick={() => changePage(1)}
                    className={`rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${focusRing}`}
                  >
                    Back to first page
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              aria-busy={isRefreshing}
              className={`grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
                isRefreshing ? "pointer-events-none opacity-60" : "opacity-100"
              }`}
            >
              {items.map((item) => (
                <FoodCard key={item._id} item={item} />
              ))}
            </div>
          )}

          {!error && items.length > 0 && pagination && pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={changePage} />
          )}
        </section>
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        FoodFlow — Explore something delicious.
      </footer>
    </div>
  );
}