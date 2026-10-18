import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getDeletedSubcategoriasProductos, getSubcategoriasProductos } from "../services";
import { SubcategoriaProducto, SubcategoriaProductoFilters } from "../types";
import { defaultSubcategoriaProductoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseSubcategoriasProductosOptions {
  deleted?: boolean;
  initialFilters?: Partial<SubcategoriaProductoFilters>;
}

export const useSubcategoriasProductos = ({
  deleted = false,
  initialFilters = {},
}: UseSubcategoriasProductosOptions = {}) => {
  const [filters, setFilters] = useState<SubcategoriaProductoFilters>({
    ...defaultSubcategoriaProductoFilters(),
    ...initialFilters,
  });
  const [subcategorias, setSubcategorias] = useState<SubcategoriaProducto[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchItems = useCallback(
    async (nextFilters: SubcategoriaProductoFilters) => {
      const signal = begin();

      try {
        setError(null);

        const response = deleted
          ? await getDeletedSubcategoriasProductos(
              {
                page: nextFilters.page,
                per_page: nextFilters.per_page,
                sort_by: nextFilters.sort_by,
                sort_dir: nextFilters.sort_dir,
              },
              signal
            )
          : await getSubcategoriasProductos(nextFilters, signal);

        if (signal.aborted) {
          return;
        }

        setSubcategorias(response.data);
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
        setError("No se pudieron cargar las subcategorías de productos.");
        fail(signal);
      }
    },
    [deleted, begin, succeed, fail]
  );

  useEffect(() => {
    fetchItems(filters);
  }, [
    fetchItems,
    filters.page,
    filters.per_page,
    filters.search,
    filters.activo,
    filters.categoria_producto_id,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<SubcategoriaProductoFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => setFilters((current) => ({ ...current, page }));
  const refresh = () => fetchItems(filters);
  const showSuccess = (message: string) => setSuccessMessage(message);
  const clearSuccess = () => setSuccessMessage(null);

  return {
    subcategorias,
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
