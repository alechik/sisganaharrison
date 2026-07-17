import { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchGestaciones = useCallback(async (nextFilters: GestacionFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getGestaciones(nextFilters);

      setGestaciones(response.data);
      setMeta(response.meta);
      setFilters((current) => ({
        ...current,
        page: response.meta.current_page,
      }));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las gestaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

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
