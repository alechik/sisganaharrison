import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getDeletedPresentaciones, getPresentaciones } from "../services";
import { Presentacion, PresentacionFilters } from "../types";
import { defaultPresentacionFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UsePresentacionesOptions {
  deleted?: boolean;
  initialFilters?: Partial<PresentacionFilters>;
}

export const usePresentaciones = ({
  deleted = false,
  initialFilters = {},
}: UsePresentacionesOptions = {}) => {
  const [filters, setFilters] = useState<PresentacionFilters>({
    ...defaultPresentacionFilters(),
    ...initialFilters,
  });
  const [tipos, setTipos] = useState<Presentacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTipos = useCallback(
    async (nextFilters: PresentacionFilters) => {
      try {
        setLoading(true);
        setError(null);

        const response = deleted
          ? await getDeletedPresentaciones({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            })
          : await getPresentaciones(nextFilters);

        setTipos(response.data);
        setMeta(response.meta);
        setFilters((current) => ({
          ...current,
          page: response.meta.current_page,
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las presentaciones.");
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

  const updateFilters = (partial: Partial<PresentacionFilters>) => {
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
