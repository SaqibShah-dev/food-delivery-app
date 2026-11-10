import { focusRingClass } from "./menuStyles";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  loading: boolean;
  error: string | null;
  onCategoryChange: (category: string) => void;
  onRetry: () => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  loading,
  error,
  onCategoryChange,
  onRetry,
}: CategoryFilterProps) {
  const chipBase = `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${focusRingClass}`;
  const activeChip = "bg-indigo-600 text-white shadow-sm";
  const idleChip =
    "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700";

  return (
    <section
      aria-label="Filter menu by category"
      className="mb-6"
    >
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <button
          type="button"
          aria-pressed={selectedCategory === ""}
          onClick={() => onCategoryChange("")}
          className={`${chipBase} ${
            selectedCategory === "" ? activeChip : idleChip
          }`}
        >
          All food
        </button>

        {loading &&
          Array.from({ length: 4 }, (_, index) => (
            <span
              key={index}
              aria-hidden="true"
              className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-slate-200"
            />
          ))}

        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={selectedCategory === category}
            onClick={() => onCategoryChange(category)}
            className={`${chipBase} ${
              selectedCategory === category
                ? activeChip
                : idleChip
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {error && (
        <p role="status" className="mt-3 text-sm text-amber-700">
          Categories could not be loaded. You can still search the
          menu.{" "}

          <button
            type="button"
            onClick={onRetry}
            className={`rounded font-semibold underline ${focusRingClass}`}
          >
            Retry
          </button>
        </p>
      )}
    </section>
  );
}