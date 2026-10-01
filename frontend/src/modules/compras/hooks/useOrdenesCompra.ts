import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getOrdenesCompra } from "../services";
import { OrdenCompra, OrdenCompraFilters } from "../types";
import { defaultOrdenCompraFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseOrdenesCompraOptions {
  initialFilters?: Partial<OrdenCompraFilters>;
}

export const useOrdenesCompra = ({ initialFilters = {} }: UseOrdenesCompraOptions = {}) => {
  const [filters, setFilters] = useState<OrdenCompraFilters>({
    ...defaultOrdenCompraFilters(),
    ...initialFilters,
  });
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchOrdenes = useCallback(async (nextFilters: OrdenCompraFilters) => {
    const signal = begin();

    try {
      setError(null);
      const response = await getOrdenesCompra(nextFilters, signal);

      if (signal.aborted) {
        return;
      }

      setOrdenes(response.data);
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
      setError("No se pudieron cargar las órdenes de compra.");
      fail(signal);
    }
  }, [begin, succeed, fail]);

  useEffect(() => {
    fetchOrdenes(filters);
  }, [
    fetchOrdenes,
    filters.page,
    filters.per_page,
    filters.cod_compra,
    filters.proveedor_id,
    filters.user_id,
    filters.estado,
    filters.fecha,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<OrdenCompraFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  return {
    ordenes,
    loading,
    isRefreshing,
    error,
    meta,
    filters,
    successMessage,
    setPage,
    updateFilters,
    refresh: () => fetchOrdenes(filters),
    showSuccess: (message: string) => setSuccessMessage(message),
    clearSuccess: () => setSuccessMessage(null),
  };
};
