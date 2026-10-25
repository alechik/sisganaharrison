import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getTareas } from "../services";
import { Tarea, TareaFilters } from "../types";
import { defaultTareaFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export const useTareas = (initialFilters: Partial<TareaFilters> = {}) => {
  const [filters, setFilters] = useState<TareaFilters>({
    ...defaultTareaFilters(),
    ...initialFilters,
  });
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const { begin, succeed, fail, initialLoading: loading } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTareas = useCallback(async (nextFilters: TareaFilters) => {
    const signal = begin();

    try {
      setError(null);
      const response = await getTareas(nextFilters, signal);
      if (signal.aborted) {
        return;
      }
      setTareas(Array.isArray(response.data) ? response.data : []);
      setMeta(response.meta ?? defaultMeta);
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
      setError("No se pudieron cargar las tareas.");
      fail(signal);
    }
  }, [begin, succeed, fail]);

  useEffect(() => {
    fetchTareas(filters);
  }, [
    fetchTareas,
    filters.page,
    filters.per_page,
    filters.search,
    filters.estado,
    filters.user_trabajador_id,
    filters.fecha_desde,
    filters.fecha_hasta,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<TareaFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  return {
    tareas,
    loading,
    error,
    meta,
    filters,
    successMessage,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    updateFilters,
    refresh: () => fetchTareas(filters),
    showSuccess: setSuccessMessage,
    clearSuccess: () => setSuccessMessage(null),
  };
};
