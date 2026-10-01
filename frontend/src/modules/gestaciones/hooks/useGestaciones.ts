import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getGestaciones } from "../services";
import { Gestacion, GestacionFilters } from "../types";
import { defaultGestacionFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseGestacionesOptions {
  initialFilters?: Partial<GestacionFilters>;
}

export const useGestaciones = ({ initialFilters = {} }: UseGestacionesOptions = {}) => {
  const [filters, setFilters] = useState<GestacionFilters>({
    ...defaultGestacionFilters(),
    ...initialFilters,
  });
  const [gestaciones, setGestaciones] = useState<Gestacion[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchGestaciones = useCallback(async (nextFilters: GestacionFilters) => {
    const signal = begin();

    try {
      setError(null);

      const response = await getGestaciones(nextFilters, signal);

      if (signal.aborted) {

        return;

      }

      setGestaciones(response.data);

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
      setError("No se pudieron cargar las gestaciones.");
      fail(signal);
    }
  }, [begin, succeed, fail]);

  useEffect(() => {
    fetchGestaciones(filters);
  }, [
    fetchGestaciones,
    filters.page,
    filters.per_page,
    filters.search,
    filters.servicio_id,
    filters.estado,
    filters.fecha_confirmacion_desde,
    filters.fecha_confirmacion_hasta,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<GestacionFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchGestaciones(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    gestaciones,
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
