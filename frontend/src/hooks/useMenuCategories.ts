import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  getAvailableFoodCategories,
} from "../api/food";

interface UseMenuCategoriesResult {
  categories: string[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export function useMenuCategories(): UseMenuCategoriesResult {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAvailableFoodCategories(
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setCategories(response.data);
        }
      } catch (requestError: unknown) {
        if (!controller.signal.aborted) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load categories.",
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadCategories();

    return () => controller.abort();
  }, [retryCount]);

  return {
    categories,
    loading,
    error,
    retry,
  };
}