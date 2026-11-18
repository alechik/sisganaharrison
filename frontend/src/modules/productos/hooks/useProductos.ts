import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getDeletedProductos, getProductos } from "../services";
import { Producto, ProductoFilters } from "../types";
import { defaultProductoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseProductosOptions {
  deleted?: boolean;
  initialFilters?: Partial<ProductoFilters>;
}

export const useProductos = ({
  deleted = false,
  initialFilters = {},
}: UseProductosOptions = {}) => {
  const [filters, setFilters] = useState<ProductoFilters>({
    ...defaultProductoFilters(),
    ...initialFilters,
  });
  const [productos, setProductos] = useState<Producto[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProductos = useCallback(
    async (nextFilters: ProductoFilters) => {
      const signal = begin();

      try {
      setError(null);

        const response = deleted
          ? await getDeletedProductos({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            }, signal)
          : await getProductos(nextFilters, signal);

        if (signal.aborted) {

          return;

        }

        setProductos(response.data);

        setMeta(response.meta);

      setFilters((current) =>
        current.page === response.meta.current_page
          ? current
          : { ...current, page: response.meta.current_page }
      );
      succeed(signal);
      } catch (err) {
      if (isAbortError(err) || signal.aborted) {
        return;
      }
      console.error(err);
      setError("No se pudieron cargar las productos.");
      fail(signal);
    }
    },
    [deleted, begin, succeed, fail]
  );

  useEffect(() => {
    fetchProductos(filters);
  }, [
    fetchProductos,
    filters.page,
    filters.per_page,
    filters.search,
    filters.activo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<ProductoFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchProductos(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    productos,
    loading,
    isRefreshing,
    error,
    meta,
    filters,
    successMessage,
    setPage,
    updateFilters,
    refresh,
    showSuccess,
    clearSuccess,
  };
};
