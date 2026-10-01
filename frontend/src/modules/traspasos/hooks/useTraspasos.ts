import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getTraspasos } from "../services";
import { Traspaso, TraspasoFilters } from "../types";
import { defaultTraspasoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export const useTraspasos = () => {
  const [filters, setFilters] = useState<TraspasoFilters>(defaultTraspasoFilters());
  const [traspasos, setTraspasos] = useState<Traspaso[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);

  const fetchTraspasos = useCallback(async (nextFilters: TraspasoFilters) => {
    const signal = begin();

    try {
      setError(null);
      const response = await getTraspasos(nextFilters, signal);
      if (signal.aborted) {

        return;

      }

      setTraspasos(response.data);

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
      setError("No se pudieron cargar los traspasos.");
      fail(signal);
    }
  }, [begin, succeed, fail]);

  useEffect(() => {
    fetchTraspasos(filters);
  }, [
    fetchTraspasos,
    filters.page,
    filters.per_page,
    filters.search,
    filters.lote_salida_id,
    filters.lote_ingreso_id,
    filters.fecha_desde,
    filters.fecha_hasta,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<TraspasoFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  return {
    traspasos,
    loading,
    isRefreshing,
    error,
    meta,
    filters,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    updateFilters,
    refresh: () => fetchTraspasos(filters),
  };
};
