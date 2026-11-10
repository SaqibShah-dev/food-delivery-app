import {
  MENU_SORT_OPTIONS,
  getResultSummary,
  type MenuSortValue,
} from "../../utils/menu";
import type { IPagination } from "../../types";

interface MenuToolbarProps {
  category: string;
  sort: MenuSortValue;
  pagination: IPagination | null;
  search: string;
  loading: boolean;
  error: string | null;
  onSortChange: (sort: MenuSortValue) => void;
}

export function MenuToolbar({
  category,
  sort,
  pagination,
  search,
  loading,
  error,
  onSortChange,
}: MenuToolbarProps) {
  const summary =
    !loading && !error && pagination
      ? getResultSummary(pagination.totalItems, search)
      : "";

  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2
          id="menu-heading"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {category || "Our menu"}
        </h2>

        <p
          role="status"
          aria-live="polite"
          className="mt-1 text-sm text-slate-500"
        >
          {summary}
        </p>
      </div>

      <div className="w-full sm:w-auto">
        <label htmlFor="menu-sort" className="sr-only">
          Sort food items
        </label>

        <select
          id="menu-sort"
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as MenuSortValue)
          }
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-300 sm:w-52"
        >
          {MENU_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}