import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getDeletedEstablecimientos, getEstablecimientos } from "../services";
import { Establecimiento, EstablecimientoFilters } from "../types";
import { defaultEstablecimientoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseEstablecimientosOptions {
  deleted?: boolean;
  initialFilters?: Partial<EstablecimientoFilters>;
}

export const useEstablecimientos = ({
  deleted = false,
  initialFilters = {},
}: UseEstablecimientosOptions = {}) => {
  const [filters, setFilters] = useState<EstablecimientoFilters>({
    ...defaultEstablecimientoFilters(),
    ...initialFilters,
  });
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchEstablecimientos = useCallback(
    async (nextFilters: EstablecimientoFilters) => {
      const signal = begin();

      try {
      setError(null);

        const response = deleted
          ? await getDeletedEstablecimientos({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            }, signal)
          : await getEstablecimientos(nextFilters, signal);

        if (signal.aborted) {

          return;

        }

        setEstablecimientos(response.data);

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
      setError("No se pudieron cargar los establecimientos.");
      fail(signal);
    }
    },
    [deleted, begin, succeed, fail]
  );

  useEffect(() => {
    fetchEstablecimientos(filters);
  }, [
    fetchEstablecimientos,
    filters.page,
    filters.per_page,
    filters.search,
    filters.activo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<EstablecimientoFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchEstablecimientos(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    establecimientos,
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
