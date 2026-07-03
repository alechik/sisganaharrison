import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getDeletedEstadosProductivos, getEstadosProductivos } from "../services";
import { EstadoProductivo, EstadoProductivoFilters } from "../types";
import { defaultEstadoProductivoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseEstadosProductivosOptions {
  deleted?: boolean;
  initialFilters?: Partial<EstadoProductivoFilters>;
}

export const useEstadosProductivos = ({
  deleted = false,
  initialFilters = {},
}: UseEstadosProductivosOptions = {}) => {
  const [filters, setFilters] = useState<EstadoProductivoFilters>({
    ...defaultEstadoProductivoFilters(),
    ...initialFilters,
  });
  const [estados, setEstados] = useState<EstadoProductivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchEstados = useCallback(
    async (nextFilters: EstadoProductivoFilters) => {
      try {
        setLoading(true);
        setError(null);

        const response = deleted
          ? await getDeletedEstadosProductivos({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            })
          : await getEstadosProductivos(nextFilters);

        setEstados(response.data);
        setMeta(response.meta);
        setFilters((current) => ({
          ...current,
          page: response.meta.current_page,
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los estados productivos.");
      } finally {
        setLoading(false);
      }
    },
    [deleted]
  );

  useEffect(() => {
    fetchEstados(filters);
  }, [
    fetchEstados,
    filters.page,
    filters.per_page,
    filters.search,
    filters.activo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<EstadoProductivoFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchEstados(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    estados,
    loading,
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
