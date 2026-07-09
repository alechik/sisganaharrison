import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getDeletedPotreros, getPotreros } from "../services";
import { Potrero, PotreroFilters } from "../types";
import { defaultPotreroFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UsePotrerosOptions {
  deleted?: boolean;
  initialFilters?: Partial<PotreroFilters>;
}

export const usePotreros = ({
  deleted = false,
  initialFilters = {},
}: UsePotrerosOptions = {}) => {
  const [filters, setFilters] = useState<PotreroFilters>({
    ...defaultPotreroFilters(),
    ...initialFilters,
  });
  const [potreros, setPotreros] = useState<Potrero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPotreros = useCallback(
    async (nextFilters: PotreroFilters) => {
      try {
        setLoading(true);
        setError(null);

        const response = deleted
          ? await getDeletedPotreros({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              establecimiento_id: nextFilters.establecimiento_id,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            })
          : await getPotreros(nextFilters);

        setPotreros(response.data);
        setMeta(response.meta);
        setFilters((current) => ({
          ...current,
          page: response.meta.current_page,
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los potreros.");
      } finally {
        setLoading(false);
      }
    },
    [deleted]
  );

  useEffect(() => {
    fetchPotreros(filters);
  }, [
    fetchPotreros,
    filters.page,
    filters.per_page,
    filters.search,
    filters.establecimiento_id,
    filters.activo,
    filters.disponibilidad,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<PotreroFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchPotreros(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    potreros,
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
