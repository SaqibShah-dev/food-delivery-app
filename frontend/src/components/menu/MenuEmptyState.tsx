interface MenuEmptyStateProps {
  hasFilters: boolean;
  canGoToFirstPage: boolean;
  onClearFilters: () => void;
  onGoToFirstPage: () => void;
}

export function MenuEmptyState({
  hasFilters,
  canGoToFirstPage,
  onClearFilters,
  onGoToFirstPage,
}: MenuEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M7 11v8M17 11v8M3 19h18" />
        </svg>
      </div>

      <h3 className="mt-4 text-lg font-semibold">No food found</h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {hasFilters
          ? "Try a different search term, remove filters, or browse another category."
          : "There’s nothing on the menu right now. Check back soon."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Show all food
          </button>
        )}

        {canGoToFirstPage && (
          <button
            type="button"
            onClick={onGoToFirstPage}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Back to first page
          </button>
        )}
      </div>
    </div>
  );
}