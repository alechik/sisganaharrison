import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getDeletedEstancias, getEstancias } from "../services";
import { Estancia, EstanciaFilters } from "../types";
import { defaultEstanciaFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseEstanciasOptions {
  deleted?: boolean;
  initialFilters?: Partial<EstanciaFilters>;
}

export const useEstancias = ({
  deleted = false,
  initialFilters = {},
}: UseEstanciasOptions = {}) => {
  const [filters, setFilters] = useState<EstanciaFilters>({
    ...defaultEstanciaFilters(),
    ...initialFilters,
  });
  const [estancias, setEstancias] = useState<Estancia[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchEstancias = useCallback(
    async (nextFilters: EstanciaFilters) => {
      const signal = begin();

      try {
      setError(null);

        const response = deleted
          ? await getDeletedEstancias({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            }, signal)
          : await getEstancias(nextFilters, signal);

        if (signal.aborted) {

          return;

        }

        setEstancias(response.data);

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
      setError("No se pudieron cargar las estancias.");
      fail(signal);
    }
    },
    [deleted, begin, succeed, fail]
  );

  useEffect(() => {
    fetchEstancias(filters);
  }, [
    fetchEstancias,
    filters.page,
    filters.per_page,
    filters.search,
    filters.activo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<EstanciaFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchEstancias(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    estancias,
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
