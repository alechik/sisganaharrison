import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getNacimientos } from "../services";
import { Nacimiento, NacimientoFilters } from "../types";
import { defaultNacimientoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export const useNacimientos = () => {
  const [filters, setFilters] = useState<NacimientoFilters>(defaultNacimientoFilters());
  const [nacimientos, setNacimientos] = useState<Nacimiento[]>([]);
  const { begin, succeed, fail, initialLoading: loading, isRefreshing } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchNacimientos = useCallback(async (nextFilters: NacimientoFilters) => {
    const signal = begin();

    try {
      setError(null);
      const response = await getNacimientos(nextFilters, signal);
      if (signal.aborted) {

        return;

      }

      setNacimientos(response.data);

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
      setError("No se pudieron cargar los nacimientos.");
      fail(signal);
    }
  }, [begin, succeed, fail]);

  useEffect(() => {
    fetchNacimientos(filters);
  }, [
    fetchNacimientos,
    filters.page,
    filters.per_page,
    filters.search,
    filters.parto_id,
    filters.animal_id,
    filters.estado_nacimiento,
    filters.sexo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<NacimientoFilters>) => {
    setFilters((current) => ({ ...current, ...partial, page: partial.page ?? 1 }));
  };

  const setPage = (page: number) => setFilters((current) => ({ ...current, page }));
  const clearSuccess = () => setSuccessMessage(null);

  return {
    nacimientos,
    loading,
    isRefreshing,
    error,
    meta,
    filters,
    successMessage,
    setPage,
    updateFilters,
    clearSuccess,
  };
};
