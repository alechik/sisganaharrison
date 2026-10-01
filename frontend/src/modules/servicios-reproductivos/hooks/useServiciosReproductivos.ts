import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getServiciosReproductivos } from "../services";
import { ServicioReproductivo, ServicioReproductivoFilters } from "../types";
import { defaultServicioReproductivoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseServiciosReproductivosOptions {
  initialFilters?: Partial<ServicioReproductivoFilters>;
}

export const useServiciosReproductivos = ({
  initialFilters = {},
}: UseServiciosReproductivosOptions = {}) => {
  const [filters, setFilters] = useState<ServicioReproductivoFilters>({
    ...defaultServicioReproductivoFilters(),
    ...initialFilters,
  });
  const [servicios, setServicios] = useState<ServicioReproductivo[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchServicios = useCallback(async (nextFilters: ServicioReproductivoFilters) => {
    const signal = begin();

    try {
      setError(null);

      const response = await getServiciosReproductivos(nextFilters, signal);

      if (signal.aborted) {

        return;

      }

      setServicios(response.data);

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
      setError("No se pudieron cargar los servicios reproductivos.");
      fail(signal);
    }
  }, [begin, succeed, fail]);

  useEffect(() => {
    fetchServicios(filters);
  }, [
    fetchServicios,
    filters.page,
    filters.per_page,
    filters.search,
    filters.hembra_id,
    filters.macho_id,
    filters.tipo_servicio,
    filters.resultado,
    filters.fecha_desde,
    filters.fecha_hasta,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<ServicioReproductivoFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchServicios(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    servicios,
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
