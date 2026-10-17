import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import {
  getAvailableFoodCategories,
  getAvailableFoodItems,
  getFoodImageUrl,
} from '../api/food';

import { useAuth } from '../hooks/useAuth';

import type {
  IFoodItem,
  IFoodMenuFilters,
  IPagination,
} from '../types';

const PAGE_SIZE = 9;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export default function Menu() {
  const { user, logout } = useAuth();

  const [items, setItems] = useState<IFoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] =
    useState<IPagination | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] =
    useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  // Categories load independently, so a category error does
  // not prevent customers from browsing the food list.
  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        const response = await getAvailableFoodCategories(
          controller.signal
        );

        if (!controller.signal.aborted) {
          setCategories(response.data);
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setCategoryError(
            getErrorMessage(err, 'Unable to load categories.')
          );
        }
      }
    };

    void loadCategories();

    return () => {
      controller.abort();
    };
  }, []);

  // Reload the menu when applied filters or the page change.
  useEffect(() => {
    const controller = new AbortController();

    const loadMenu = async () => {
      setLoading(true);
      setError(null);

      const filters: IFoodMenuFilters = {
        page,
        limit: PAGE_SIZE,
      };

      if (category) {
        filters.category = category;
      }

      if (search) {
        filters.search = search;
      }

      try {
        const response = await getAvailableFoodItems(
          filters,
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        setItems(response.data.items);
        setPagination(response.data.pagination);
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(
            getErrorMessage(err, 'Unable to load the menu.')
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadMenu();

    return () => {
      controller.abort();
    };
  }, [page, category, search, retryCount]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setCategory('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Customer navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-indigo-600"
          >
            FoodFlow
          </Link>

          <nav
            aria-label="Customer navigation"
            className="flex flex-wrap items-center justify-end gap-3"
          >
            {user ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">
                  Hello, {user.name}
                </span>

                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Admin panel
                  </Link>
                )}

                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Introduction */}
        <section className="mb-8 rounded-2xl bg-indigo-950 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-semibold text-indigo-200">
            Fresh choices. Great flavors.
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Find your next favorite meal
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100">
            Explore our menu and discover food for every craving.
            Search for a dish or browse by category.
          </p>
        </section>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mb-6 flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="menu-search" className="sr-only">
            Search food by name
          </label>

          <input
            id="menu-search"
            type="search"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder="Search pizza, chicken, drinks..."
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />

          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Search
          </button>

          {(search || category || searchInput) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear
            </button>
          )}
        </form>

        {/* Category filters */}
        <section aria-label="Filter menu by category">
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={category === ''}
              onClick={() => handleCategoryChange('')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === ''
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              All food
            </button>

            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => handleCategoryChange(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === item
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {categoryError && (
            <p
              role="status"
              className="mb-5 text-sm text-amber-700"
            >
              Categories could not be loaded. You can still
              browse or search the menu.
            </p>
          )}
        </section>

        {/* Results */}
        <section aria-labelledby="menu-heading">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2
              id="menu-heading"
              className="text-2xl font-bold tracking-tight"
            >
              {category || 'Our menu'}
            </h2>

            {!loading && !error && pagination && (
              <p className="text-sm text-slate-500">
                {pagination.totalItems}{' '}
                {pagination.totalItems === 1 ? 'item' : 'items'}
                {search ? ` matching "${search}"` : ''}
              </p>
            )}
          </div>

          {loading ? (
            <div
              role="status"
              className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500"
            >
              Loading menu…
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
            >
              <p className="text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={() =>
                  setRetryCount((current) => current + 1)
                }
                className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
              <h3 className="text-lg font-semibold">
                No food found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another search or choose a different category.
              </p>

              {(search || category) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Show all food
                </button>
              )}

              {page > 1 && (
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="ml-3 mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Back to first page
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <img
                    src={getFoodImageUrl(item.image)}
                    alt={item.name}
                    loading="lazy"
                    className="aspect-video w-full bg-slate-100 object-cover"
                  />

                  <div className="p-5">
                    <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {item.category}
                    </span>

                    <h3 className="mt-3 text-lg font-bold">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>

                    <p className="mt-5 text-xl font-bold text-indigo-600">
                      {currencyFormatter.format(item.price)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading &&
            !error &&
            items.length > 0 &&
            pagination &&
            pagination.totalPages > 1 && (
              <nav
                aria-label="Menu pagination"
                className="mt-8 flex items-center justify-center gap-4"
              >
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <p
                  aria-live="polite"
                  className="text-sm text-slate-600"
                >
                  Page {pagination.page} of {pagination.totalPages}
                </p>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
            )}
        </section>
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        FoodFlow — Explore something delicious.
      </footer>
    </div>
  );
}