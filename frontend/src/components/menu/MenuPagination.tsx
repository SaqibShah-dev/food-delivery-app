import type { IPagination } from "../../types";
import { getMenuPageNumbers } from "../../utils/menu";

interface MenuPaginationProps {
  pagination: IPagination;
  onPageChange: (page: number) => void;
}

export function MenuPagination({
  pagination,
  onPageChange,
}: MenuPaginationProps) {
  const pages = getMenuPageNumbers(
    pagination.page,
    pagination.totalPages,
  );

  const buttonClass =
    "rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

  return (
    <nav
      aria-label="Menu pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        disabled={!pagination.hasPreviousPage}
        onClick={() => onPageChange(pagination.page - 1)}
        className={`${buttonClass} border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Previous
      </button>

      <p
        aria-live="polite"
        className="px-2 text-sm text-slate-600 sm:hidden"
      >
        Page {pagination.page} of {pagination.totalPages}
      </p>

      <ul className="hidden items-center gap-1 sm:flex">
        {pages.map((page, index) =>
          page === "…" ? (
            <li
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-2 text-slate-400"
            >
              …
            </li>
          ) : (
            <li key={page}>
              <button
                type="button"
                aria-label={`Page ${page}`}
                aria-current={
                  page === pagination.page ? "page" : undefined
                }
                onClick={() => onPageChange(page)}
                className={`${buttonClass} min-w-10 transition-colors ${
                  page === pagination.page
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.page + 1)}
        className={`${buttonClass} border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Next
      </button>
    </nav>
  );
}