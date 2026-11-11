import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getDeletedTiposIngresos, getTiposIngresos } from "../services";
import { TipoIngreso, TipoIngresoFilters } from "../types";
import { defaultTipoIngresoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseTiposIngresosOptions {
  deleted?: boolean;
  initialFilters?: Partial<TipoIngresoFilters>;
}

export const useTiposIngresos = ({
  deleted = false,
  initialFilters = {},
}: UseTiposIngresosOptions = {}) => {
  const [filters, setFilters] = useState<TipoIngresoFilters>({
    ...defaultTipoIngresoFilters(),
    ...initialFilters,
  });
  const [tipos, setTipos] = useState<TipoIngreso[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTipos = useCallback(
    async (nextFilters: TipoIngresoFilters) => {
      const signal = begin();

      try {
        setError(null);

        const response = deleted
          ? await getDeletedTiposIngresos(
              {
                page: nextFilters.page,
                per_page: nextFilters.per_page,
                sort_by: nextFilters.sort_by,
                sort_dir: nextFilters.sort_dir,
              },
              signal
            )
          : await getTiposIngresos(nextFilters, signal);

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
        setError("No se pudieron cargar los tipos de ingreso.");
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
    filters.estado,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<TipoIngresoFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  return {
    tipos,
    loading,
    isRefreshing,
    error,
    meta,
    filters,
    successMessage,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    updateFilters,
    refresh: () => fetchTipos(filters),
    showSuccess: (message: string) => setSuccessMessage(message),
    clearSuccess: () => setSuccessMessage(null),
  };
};
