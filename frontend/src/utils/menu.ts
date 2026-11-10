export const MENU_PAGE_SIZE = 9;
export const MENU_SEARCH_DEBOUNCE_MS = 400;

export const MENU_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
] as const;

export type MenuSortValue = (typeof MENU_SORT_OPTIONS)[number]["value"];

export function getMenuPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const candidatePages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  const sortedPages = [...candidatePages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const pages: (number | "…")[] = [];

  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      pages.push("…");
    }

    pages.push(page);
  });

  return pages;
}

export function getResultSummary(
  totalItems: number,
  search: string,
): string {
  const itemLabel = totalItems === 1 ? "item" : "items";

  return `${totalItems} ${itemLabel}${
    search ? ` matching “${search}”` : ""
  }`;
}