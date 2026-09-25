import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getDeletedTiposSalidas, getTiposSalidas } from "../services";
import { TipoSalida, TipoSalidaFilters } from "../types";
import { defaultTipoSalidaFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseTiposSalidasOptions {
  deleted?: boolean;
  initialFilters?: Partial<TipoSalidaFilters>;
}

export const useTiposSalidas = ({
  deleted = false,
  initialFilters = {},
}: UseTiposSalidasOptions = {}) => {
  const [filters, setFilters] = useState<TipoSalidaFilters>({
    ...defaultTipoSalidaFilters(),
    ...initialFilters,
  });
  const [tipos, setTipos] = useState<TipoSalida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTipos = useCallback(
    async (nextFilters: TipoSalidaFilters) => {
      try {
        setLoading(true);
        setError(null);

        const response = deleted
          ? await getDeletedTiposSalidas({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            })
          : await getTiposSalidas(nextFilters);

        setTipos(response.data);
        setMeta(response.meta);
        setFilters((current) => ({
          ...current,
          page: response.meta.current_page,
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los tipos de salida.");
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
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<TipoSalidaFilters>) => {
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
