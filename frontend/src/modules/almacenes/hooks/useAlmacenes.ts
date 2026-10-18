import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getAlmacenes, getDeletedAlmacenes } from "../services";
import { Almacen, AlmacenFilters } from "../types";
import { defaultAlmacenFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseAlmacenesOptions {
  deleted?: boolean;
  initialFilters?: Partial<AlmacenFilters>;
}

export const useAlmacenes = ({
  deleted = false,
  initialFilters = {},
}: UseAlmacenesOptions = {}) => {
  const [filters, setFilters] = useState<AlmacenFilters>({
    ...defaultAlmacenFilters(),
    ...initialFilters,
  });
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAlmacenes = useCallback(
    async (nextFilters: AlmacenFilters) => {
      const signal = begin();

      try {
        setError(null);

        const response = deleted
          ? await getDeletedAlmacenes(
              {
                page: nextFilters.page,
                per_page: nextFilters.per_page,
                sort_by: nextFilters.sort_by,
                sort_dir: nextFilters.sort_dir,
              },
              signal
            )
          : await getAlmacenes(nextFilters, signal);

        if (signal.aborted) {
          return;
        }

        setAlmacenes(response.data);
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
        setError("No se pudieron cargar los almacenes.");
        fail(signal);
      }
    },
    [deleted, begin, succeed, fail]
  );

  useEffect(() => {
    fetchAlmacenes(filters);
  }, [
    fetchAlmacenes,
    filters.page,
    filters.per_page,
    filters.search,
    filters.activo,
    filters.establecimiento_id,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<AlmacenFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => setFilters((current) => ({ ...current, page }));
  const refresh = () => fetchAlmacenes(filters);
  const showSuccess = (message: string) => setSuccessMessage(message);
  const clearSuccess = () => setSuccessMessage(null);

  return {
    almacenes,
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
