import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getSalidas } from "../services";
import { Salida, SalidaFilters } from "../types";
import { defaultSalidaFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export const useSalidas = () => {
  const [filters, setFilters] = useState<SalidaFilters>(defaultSalidaFilters());
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);

  const fetchSalidas = useCallback(async (nextFilters: SalidaFilters) => {
    const signal = begin();

    try {
      setError(null);
      const response = await getSalidas(nextFilters, signal);
      if (signal.aborted) {

        return;

      }

      setSalidas(response.data);

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
      setError("No se pudieron cargar las salidas.");
      fail(signal);
    }
  }, [begin, succeed, fail]);

  useEffect(() => {
    fetchSalidas(filters);
  }, [
    fetchSalidas,
    filters.page,
    filters.per_page,
    filters.codigo,
    filters.cliente,
    filters.tipo_salida_id,
    filters.estado,
    filters.fecha_desde,
    filters.fecha_hasta,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<SalidaFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  return {
    salidas,
    loading,
    isRefreshing,
    error,
    meta,
    filters,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    updateFilters,
    refresh: () => fetchSalidas(filters),
  };
};
