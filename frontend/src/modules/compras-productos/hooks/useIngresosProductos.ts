import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getIngresosProductos } from "../services";
import { IngresoProducto, IngresoProductoFilters } from "../types";
import { defaultIngresoProductoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export const useIngresosProductos = () => {
  const [filters, setFilters] = useState<IngresoProductoFilters>(defaultIngresoProductoFilters());
  const [ingresos, setIngresos] = useState<IngresoProducto[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);

  const fetchIngresos = useCallback(
    async (nextFilters: IngresoProductoFilters) => {
      const signal = begin();

      try {
        setError(null);
        const response = await getIngresosProductos(nextFilters, signal);
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
        setError("No se pudieron cargar los ingresos de productos.");
        fail(signal);
      }
    },
    [begin, succeed, fail]
  );

  useEffect(() => {
    fetchIngresos(filters);
  }, [
    fetchIngresos,
    filters.page,
    filters.per_page,
    filters.cod_ingreso,
    filters.proveedor_id,
    filters.almacen_id,
    filters.fecha,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<IngresoProductoFilters>) => {
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
