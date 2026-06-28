import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getDeletedRazas, getRazas } from "../services";
import { Raza, RazaFilters } from "../types";
import { defaultRazaFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseRazasOptions {
  deleted?: boolean;
  initialFilters?: Partial<RazaFilters>;
}

export const useRazas = ({ deleted = false, initialFilters = {} }: UseRazasOptions = {}) => {
  const [filters, setFilters] = useState<RazaFilters>({
    ...defaultRazaFilters(),
    ...initialFilters,
  });
  const [razas, setRazas] = useState<Raza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRazas = useCallback(async (nextFilters: RazaFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = deleted
        ? await getDeletedRazas({
            page: nextFilters.page,
            per_page: nextFilters.per_page,
            sort_by: nextFilters.sort_by,
            sort_dir: nextFilters.sort_dir,
          })
        : await getRazas(nextFilters);

      setRazas(response.data);
      setMeta(response.meta);
      setFilters((current) => ({
        ...current,
        page: response.meta.current_page,
      }));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las razas.");
    } finally {
      setLoading(false);
    }
  }, [deleted]);

  useEffect(() => {
    fetchRazas(filters);
  }, [fetchRazas, filters.page, filters.per_page, filters.search, filters.estado, filters.sort_by, filters.sort_dir]);

  const updateFilters = (partial: Partial<RazaFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchRazas(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    razas,
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
