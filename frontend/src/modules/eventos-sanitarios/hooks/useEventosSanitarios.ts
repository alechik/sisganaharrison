import { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchEventos = useCallback(async (nextFilters: EventoSanitarioFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getEventosSanitarios(nextFilters);

      setEventos(response.data);
      setMeta(response.meta);
      setFilters((current) => ({
        ...current,
        page: response.meta.current_page,
      }));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los eventos sanitarios.");
    } finally {
      setLoading(false);
    }
  }, []);

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
