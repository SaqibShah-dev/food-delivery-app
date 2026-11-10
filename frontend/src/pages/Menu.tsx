import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { SiteFooter, SiteHeader } from "../components/layout";
import {
  ActiveFilters,
  CategoryFilter,
  FoodCardSkeleton,
  MenuEmptyState,
  MenuErrorState,
  MenuGrid,
  MenuHero,
  MenuPagination,
  MenuToolbar,
} from "../components/menu";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useMenu } from "../hooks/useMenu";
import { useMenuCategories } from "../hooks/useMenuCategories";
import {
  MENU_PAGE_SIZE,
  MENU_SEARCH_DEBOUNCE_MS,
  type MenuSortValue,
} from "../utils/menu";

export default function Menu() {
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<MenuSortValue>("newest");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(
    searchInput,
    MENU_SEARCH_DEBOUNCE_MS,
  );

  const search = debouncedSearch.trim();

  const {
    categories,
    loading: categoriesLoading,
    error: categoryError,
    retry: retryCategories,
  } = useMenuCategories();

  const {
    items,
    pagination,
    loading,
    error,
    hasLoadedOnce,
    isRefreshing,
    retry: retryMenu,
  } = useMenu({
    page,
    category,
    search,
    sort,
  });

  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage);

    resultsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchInput(searchInput.trim());
    setPage(1);
  };

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setCategory("");
    setSort("newest");
    setPage(1);
  };

  const hasFilters = Boolean(
    search || category || sort !== "newest",
  );

  const isInitialLoad = loading && !hasLoadedOnce;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <a
        href="#menu-results"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to menu
      </a>

      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <MenuHero
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onClearSearch={clearSearch}
            onSearch={handleSearch}
          />

          <CategoryFilter
            categories={categories}
            selectedCategory={category}
            loading={categoriesLoading}
            error={categoryError}
            onCategoryChange={handleCategoryChange}
            onRetry={retryCategories}
          />

          <section
            id="menu-results"
            ref={resultsRef}
            aria-labelledby="menu-heading"
            className="scroll-mt-24"
          >
            <MenuToolbar
              category={category}
              sort={sort}
              pagination={pagination}
              search={search}
              loading={loading}
              error={error}
              onSortChange={(nextSort) => {
                setSort(nextSort);
                setPage(1);
              }}
            />

            <ActiveFilters
              category={category}
              search={search}
              sort={sort}
              onRemoveCategory={() => handleCategoryChange("")}
              onRemoveSearch={clearSearch}
              onRemoveSort={() => {
                setSort("newest");
                setPage(1);
              }}
              onClearAll={handleClearFilters}
            />

            {isInitialLoad ? (
              <div
                aria-busy="true"
                aria-label="Loading menu"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from(
                  { length: MENU_PAGE_SIZE },
                  (_, index) => (
                    <FoodCardSkeleton key={index} />
                  ),
                )}
              </div>
            ) : error ? (
              <MenuErrorState
                message={error}
                onRetry={retryMenu}
              />
            ) : items.length === 0 ? (
              <MenuEmptyState
                hasFilters={hasFilters}
                canGoToFirstPage={page > 1}
                onClearFilters={handleClearFilters}
                onGoToFirstPage={() => changePage(1)}
              />
            ) : (
              <>
                <MenuGrid
                  items={items}
                  isRefreshing={isRefreshing}
                />

                {pagination && pagination.totalPages > 1 && (
                  <MenuPagination
                    pagination={pagination}
                    onPageChange={changePage}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}