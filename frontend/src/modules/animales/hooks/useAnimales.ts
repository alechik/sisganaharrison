import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getDeletedAnimales, getAnimales } from "../services";
import { Animal, AnimalFilters } from "../types";
import { defaultAnimalFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseAnimalesOptions {
  deleted?: boolean;
  initialFilters?: Partial<AnimalFilters>;
}

export const useAnimales = ({
  deleted = false,
  initialFilters = {},
}: UseAnimalesOptions = {}) => {
  const [filters, setFilters] = useState<AnimalFilters>({
    ...defaultAnimalFilters(),
    ...initialFilters,
  });
  const [animales, setAnimales] = useState<Animal[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAnimales = useCallback(
    async (nextFilters: AnimalFilters) => {
      const signal = begin();

      try {
      setError(null);

        const response = deleted
          ? await getDeletedAnimales({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              lote_id: nextFilters.lote_id,
              raza_id: nextFilters.raza_id,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            }, signal)
          : await getAnimales(nextFilters, signal);

        if (signal.aborted) {

          return;

        }

        setAnimales(response.data);

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
      setError("No se pudieron cargar los animales.");
      fail(signal);
    }
    },
    [deleted, begin, succeed, fail]
  );

  useEffect(() => {
    fetchAnimales(filters);
  }, [
    fetchAnimales,
    filters.page,
    filters.per_page,
    filters.search,
    filters.raza_id,
    filters.categoria_id,
    filters.estado_productivo_id,
    filters.lote_id,
    filters.sexo,
    filters.activo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<AnimalFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchAnimales(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    animales,
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
