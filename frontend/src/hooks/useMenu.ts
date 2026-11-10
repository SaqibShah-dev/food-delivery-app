import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getAvailableFoodItems } from "../api/food";
import type {
  IFoodItem,
  IFoodMenuFilters,
  IPagination,
} from "../types";
import {
  MENU_PAGE_SIZE,
  type MenuSortValue,
} from "../utils/menu";

interface UseMenuArgs {
  page: number;
  category: string;
  search: string;
  sort: MenuSortValue;
}

interface UseMenuResult {
  items: IFoodItem[];
  pagination: IPagination | null;
  loading: boolean;
  error: string | null;
  hasLoadedOnce: boolean;
  isRefreshing: boolean;
  retry: () => void;
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      fallback
    );
  }

  return error instanceof Error ? error.message : fallback;
}

export function useMenu({
  page,
  category,
  search,
  sort,
}: UseMenuArgs): UseMenuResult {
  const [items, setItems] = useState<IFoodItem[]>([]);
  const [pagination, setPagination] =
    useState<IPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setRetryCount((currentCount) => currentCount + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadMenu = async () => {
      setLoading(true);
      setError(null);

      const filters: IFoodMenuFilters = {
        page,
        limit: MENU_PAGE_SIZE,
      };

      if (category) {
        filters.category = category;
      }

      if (search) {
        filters.search = search;
      }

      if (sort !== "newest") {
        filters.sort = sort;
      }

      try {
        const response = await getAvailableFoodItems(
          filters,
          controller.signal,
        );

        if (controller.signal.aborted) {
          return;
        }

        setItems(response.data.items);
        setPagination(response.data.pagination);
        setHasLoadedOnce(true);
      } catch (requestError: unknown) {
        if (!controller.signal.aborted) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load the menu.",
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadMenu();

    return () => controller.abort();
  }, [page, category, search, sort, retryCount]);

  return {
    items,
    pagination,
    loading,
    error,
    hasLoadedOnce,
    isRefreshing: loading && hasLoadedOnce,
    retry,
  };
}