import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getPartos } from "../services";
import { Parto, PartoFilters } from "../types";
import { defaultPartoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UsePartosOptions {
  initialFilters?: Partial<PartoFilters>;
}

export const usePartos = ({ initialFilters = {} }: UsePartosOptions = {}) => {
  const [filters, setFilters] = useState<PartoFilters>({
    ...defaultPartoFilters(),
    ...initialFilters,
  });
  const [partos, setPartos] = useState<Parto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPartos = useCallback(async (nextFilters: PartoFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPartos(nextFilters);

      setPartos(response.data);
      setMeta(response.meta);
      setFilters((current) => ({
        ...current,
        page: response.meta.current_page,
      }));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los partos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartos(filters);
  }, [
    fetchPartos,
    filters.page,
    filters.per_page,
    filters.search,
    filters.gestacion_id,
    filters.fecha_parto_desde,
    filters.fecha_parto_hasta,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<PartoFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchPartos(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    partos,
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
