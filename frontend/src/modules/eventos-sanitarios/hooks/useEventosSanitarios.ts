import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getEventosSanitarios } from "../services";
import { EventoSanitario, EventoSanitarioFilters } from "../types";
import { defaultEventoSanitarioFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseEventosSanitariosOptions {
  initialFilters?: Partial<EventoSanitarioFilters>;
}

export const useEventosSanitarios = ({
  initialFilters = {},
}: UseEventosSanitariosOptions = {}) => {
  const [filters, setFilters] = useState<EventoSanitarioFilters>({
    ...defaultEventoSanitarioFilters(),
    ...initialFilters,
  });
  const [eventos, setEventos] = useState<EventoSanitario[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchEventos = useCallback(async (nextFilters: EventoSanitarioFilters) => {
    const signal = begin();

    try {
      setError(null);

      const response = await getEventosSanitarios(nextFilters, signal);

      if (signal.aborted) {

        return;

      }

      setEventos(response.data);

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
      setError("No se pudieron cargar los eventos sanitarios.");
      fail(signal);
    }
  }, [begin, succeed, fail]);

  useEffect(() => {
    fetchEventos(filters);
  }, [
    fetchEventos,
    filters.page,
    filters.per_page,
    filters.search,
    filters.animal_id,
    filters.tipo_evento_id,
    filters.medicamento_id,
    filters.fecha_desde,
    filters.fecha_hasta,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<EventoSanitarioFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchEventos(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    eventos,
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
