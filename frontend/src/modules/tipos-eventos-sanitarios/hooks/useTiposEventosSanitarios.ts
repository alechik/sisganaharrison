import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getDeletedTiposEventosSanitarios, getTiposEventosSanitarios } from "../services";
import { TipoEventoSanitario, TipoEventoSanitarioFilters } from "../types";
import { defaultTipoEventoSanitarioFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseTiposEventosSanitariosOptions {
  deleted?: boolean;
  initialFilters?: Partial<TipoEventoSanitarioFilters>;
}

export const useTiposEventosSanitarios = ({
  deleted = false,
  initialFilters = {},
}: UseTiposEventosSanitariosOptions = {}) => {
  const [filters, setFilters] = useState<TipoEventoSanitarioFilters>({
    ...defaultTipoEventoSanitarioFilters(),
    ...initialFilters,
  });
  const [tipos, setTipos] = useState<TipoEventoSanitario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTipos = useCallback(
    async (nextFilters: TipoEventoSanitarioFilters) => {
      try {
        setLoading(true);
        setError(null);

        const response = deleted
          ? await getDeletedTiposEventosSanitarios({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            })
          : await getTiposEventosSanitarios(nextFilters);

        setTipos(response.data);
        setMeta(response.meta);
        setFilters((current) => ({
          ...current,
          page: response.meta.current_page,
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los tipos de eventos sanitarios.");
      } finally {
        setLoading(false);
      }
    },
    [deleted]
  );

  useEffect(() => {
    fetchTipos(filters);
  }, [
    fetchTipos,
    filters.page,
    filters.per_page,
    filters.search,
    filters.activo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<TipoEventoSanitarioFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchTipos(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    tipos,
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
