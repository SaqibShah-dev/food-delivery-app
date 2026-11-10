import type { MenuSortValue } from "../../utils/menu";
import { MENU_SORT_OPTIONS } from "../../utils/menu";

interface ActiveFiltersProps {
  category: string;
  search: string;
  sort: MenuSortValue;
  onRemoveCategory: () => void;
  onRemoveSearch: () => void;
  onRemoveSort: () => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  category,
  search,
  sort,
  onRemoveCategory,
  onRemoveSearch,
  onRemoveSort,
  onClearAll,
}: ActiveFiltersProps) {
  const hasFilters =
    Boolean(category || search || sort !== "newest");

  if (!hasFilters) return null;

  const activeSort = MENU_SORT_OPTIONS.find(
    (option) => option.value === sort,
  );

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {category && (
        <button
          type="button"
          onClick={onRemoveCategory}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
        >
          Category: {category}
          <span aria-hidden="true">×</span>
          <span className="sr-only">Remove category filter</span>
        </button>
      )}

      {search && (
        <button
          type="button"
          onClick={onRemoveSearch}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
        >
          Search: {search}
          <span aria-hidden="true">×</span>
          <span className="sr-only">Remove search filter</span>
        </button>
      )}

      {sort !== "newest" && (
        <button
          type="button"
          onClick={onRemoveSort}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
        >
          Sort: {activeSort?.label}
          <span aria-hidden="true">×</span>
          <span className="sr-only">Remove sort filter</span>
        </button>
      )}

      <button
        type="button"
        onClick={onClearAll}
        className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 underline transition-colors hover:text-slate-900"
      >
        Clear all
      </button>
    </div>
  );
}