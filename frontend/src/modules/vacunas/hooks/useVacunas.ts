import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getDeletedVacunas, getVacunas } from "../services";
import { Vacuna, VacunaFilters } from "../types";
import { defaultVacunaFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseVacunasOptions {
  deleted?: boolean;
  initialFilters?: Partial<VacunaFilters>;
}

export const useVacunas = ({
  deleted = false,
  initialFilters = {},
}: UseVacunasOptions = {}) => {
  const [filters, setFilters] = useState<VacunaFilters>({
    ...defaultVacunaFilters(),
    ...initialFilters,
  });
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchVacunas = useCallback(
    async (nextFilters: VacunaFilters) => {
      try {
        setLoading(true);
        setError(null);

        const response = deleted
          ? await getDeletedVacunas({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            })
          : await getVacunas(nextFilters);

        setVacunas(response.data);
        setMeta(response.meta);
        setFilters((current) => ({
          ...current,
          page: response.meta.current_page,
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las vacunas.");
      } finally {
        setLoading(false);
      }
    },
    [deleted]
  );

  useEffect(() => {
    fetchVacunas(filters);
  }, [
    fetchVacunas,
    filters.page,
    filters.per_page,
    filters.search,
    filters.activo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<VacunaFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchVacunas(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    vacunas,
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
