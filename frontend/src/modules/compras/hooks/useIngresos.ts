import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getIngresos } from "../services";
import { Ingreso, IngresoFilters } from "../types";
import { defaultIngresoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export const useIngresos = () => {
  const [filters, setFilters] = useState<IngresoFilters>(defaultIngresoFilters());
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);

  const fetchIngresos = useCallback(async (nextFilters: IngresoFilters) => {
    const signal = begin();

    try {
      setError(null);
      const response = await getIngresos(nextFilters, signal);
      if (signal.aborted) {

        return;

      }

      setIngresos(response.data);

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
      setError("No se pudieron cargar los ingresos.");
      fail(signal);
    }
  }, [begin, succeed, fail]);

  useEffect(() => {
    fetchIngresos(filters);
  }, [
    fetchIngresos,
    filters.page,
    filters.per_page,
    filters.codigo,
    filters.proveedor_id,
    filters.cuarentena_id,
    filters.lote_id,
    filters.fecha,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<IngresoFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  return {
    ingresos,
    loading,
    isRefreshing,
    error,
    meta,
    filters,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    updateFilters,
    refresh: () => fetchIngresos(filters),
  };
};
