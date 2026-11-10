import type { FormEvent } from "react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

interface MenuHeroProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onClearSearch: () => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
}

export function MenuHero({
  searchInput,
  onSearchInputChange,
  onClearSearch,
  onSearch,
}: MenuHeroProps) {
  return (
    <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
      <div className="max-w-3xl">
        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-100">
          Fresh, fast and delivered to you
        </span>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Find your next
          <span className="text-indigo-300"> favorite meal</span>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
          Search for a dish, browse categories, and add your
          favorites to the cart in a few taps.
        </p>
      </div>

      <form
        onSubmit={onSearch}
        role="search"
        className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="menu-search" className="sr-only">
          Search food by name
        </label>

        <div className="relative min-w-0 flex-1">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>

          <input
            id="menu-search"
            type="search"
            value={searchInput}
            onChange={(event) =>
              onSearchInputChange(event.target.value)
            }
            placeholder="Search pizza, biryani, drinks..."
            autoComplete="off"
            className="w-full rounded-xl border border-transparent bg-white py-3 pl-12 pr-10 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-300 [&::-webkit-search-cancel-button]:hidden"
          />

          {searchInput && (
            <button
              type="button"
              onClick={onClearSearch}
              aria-label="Clear search"
              className={`absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 ${focusRing}`}
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
          className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
        >
          Search
        </button>
      </form>
    </section>
  );
}