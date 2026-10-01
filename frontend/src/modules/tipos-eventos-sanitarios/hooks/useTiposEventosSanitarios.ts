import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getDeletedTiposEventosSanitarios, getTiposEventosSanitarios } from "../services";
import { TipoEventoSanitario, TipoEventoSanitarioFilters } from "../types";
import { defaultTipoEventoSanitarioFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseTiposEventosSanitariosOptions {
  deleted?: boolean;
  initialFilters?: Partial<TipoEventoSanitarioFilters>;
}

export const useTiposEventosSanitarios = ({
  deleted = false,
  initialFilters = {},
}: UseTiposEventosSanitariosOptions = {}) => {
  const [filters, setFilters] = useState<TipoEventoSanitarioFilters>({
    ...defaultTipoEventoSanitarioFilters(),
    ...initialFilters,
  });
  const [tipos, setTipos] = useState<TipoEventoSanitario[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTipos = useCallback(
    async (nextFilters: TipoEventoSanitarioFilters) => {
      const signal = begin();

      try {
      setError(null);

        const response = deleted
          ? await getDeletedTiposEventosSanitarios({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            }, signal)
          : await getTiposEventosSanitarios(nextFilters, signal);

        if (signal.aborted) {

          return;

        }

        setTipos(response.data);

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
      setError("No se pudieron cargar los tipos de eventos sanitarios.");
      fail(signal);
    }
    },
    [deleted, begin, succeed, fail]
  );

  useEffect(() => {
    fetchTipos(filters);
  }, [
    fetchTipos,
    filters.page,
    filters.per_page,
    filters.search,
    filters.activo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<TipoEventoSanitarioFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchTipos(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    tipos,
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
