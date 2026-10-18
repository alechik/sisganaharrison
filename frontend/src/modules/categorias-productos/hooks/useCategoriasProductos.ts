import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getCategoriasProductos, getDeletedCategoriasProductos } from "../services";
import { CategoriaProducto, CategoriaProductoFilters } from "../types";
import { defaultCategoriaProductoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseCategoriasProductosOptions {
  deleted?: boolean;
  initialFilters?: Partial<CategoriaProductoFilters>;
}

export const useCategoriasProductos = ({
  deleted = false,
  initialFilters = {},
}: UseCategoriasProductosOptions = {}) => {
  const [filters, setFilters] = useState<CategoriaProductoFilters>({
    ...defaultCategoriaProductoFilters(),
    ...initialFilters,
  });
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCategorias = useCallback(
    async (nextFilters: CategoriaProductoFilters) => {
      const signal = begin();

      try {
        setError(null);

        const response = deleted
          ? await getDeletedCategoriasProductos(
              {
                page: nextFilters.page,
                per_page: nextFilters.per_page,
                sort_by: nextFilters.sort_by,
                sort_dir: nextFilters.sort_dir,
              },
              signal
            )
          : await getCategoriasProductos(nextFilters, signal);

        if (signal.aborted) {
          return;
        }

        setCategorias(response.data);
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
        setError("No se pudieron cargar las categorías de productos.");
        fail(signal);
      }
    },
    [deleted, begin, succeed, fail]
  );

  useEffect(() => {
    fetchCategorias(filters);
  }, [fetchCategorias, filters.page, filters.per_page, filters.search, filters.activo, filters.sort_by, filters.sort_dir]);

  const updateFilters = (partial: Partial<CategoriaProductoFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchCategorias(filters);
  const showSuccess = (message: string) => setSuccessMessage(message);
  const clearSuccess = () => setSuccessMessage(null);

  return {
    categorias,
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
