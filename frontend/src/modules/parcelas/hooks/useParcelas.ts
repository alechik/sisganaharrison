import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getDeletedParcelas, getParcelas } from "../services";
import { Parcela, ParcelaFilters } from "../types";
import { defaultParcelaFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseParcelasOptions {
  deleted?: boolean;
  initialFilters?: Partial<ParcelaFilters>;
}

export const useParcelas = ({
  deleted = false,
  initialFilters = {},
}: UseParcelasOptions = {}) => {
  const [filters, setFilters] = useState<ParcelaFilters>({
    ...defaultParcelaFilters(),
    ...initialFilters,
  });
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchParcelas = useCallback(
    async (nextFilters: ParcelaFilters) => {
      const signal = begin();

      try {
      setError(null);

        const response = deleted
          ? await getDeletedParcelas({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              estancia_id: nextFilters.estancia_id,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            }, signal)
          : await getParcelas(nextFilters, signal);

        if (signal.aborted) {

          return;

        }

        setParcelas(response.data);

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
      setError("No se pudieron cargar las parcelas.");
      fail(signal);
    }
    },
    [deleted, begin, succeed, fail]
  );

  useEffect(() => {
    fetchParcelas(filters);
  }, [
    fetchParcelas,
    filters.page,
    filters.per_page,
    filters.search,
    filters.estancia_id,
    filters.activo,
    filters.disponibilidad,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<ParcelaFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchParcelas(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    parcelas,
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
