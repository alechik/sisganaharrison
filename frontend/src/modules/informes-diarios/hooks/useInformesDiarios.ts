import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getInformesDiarios } from "../services";
import { InformeDiario, InformeDiarioFilters } from "../types";
import { defaultInformeDiarioFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export const useInformesDiarios = (initialFilters: Partial<InformeDiarioFilters> = {}) => {
  const [filters, setFilters] = useState<InformeDiarioFilters>({
    ...defaultInformeDiarioFilters(),
    ...initialFilters,
  });
  const [informes, setInformes] = useState<InformeDiario[]>([]);
  const { begin, succeed, fail, initialLoading: loading } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchInformes = useCallback(async (nextFilters: InformeDiarioFilters) => {
    const signal = begin();

    try {
      setError(null);
      const response = await getInformesDiarios(nextFilters, signal);
      if (signal.aborted) {
        return;
      }
      setInformes(Array.isArray(response.data) ? response.data : []);
      setMeta(response.meta ?? defaultMeta);
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
      setError("No se pudieron cargar los informes diarios.");
      fail(signal);
    }
  }, [begin, succeed, fail]);

  useEffect(() => {
    fetchInformes(filters);
  }, [
    fetchInformes,
    filters.page,
    filters.per_page,
    filters.search,
    filters.revisado,
    filters.user_trabajador_id,
    filters.fecha_desde,
    filters.fecha_hasta,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<InformeDiarioFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  return {
    informes,
    loading,
    error,
    meta,
    filters,
    successMessage,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    updateFilters,
    refresh: () => fetchInformes(filters),
    showSuccess: setSuccessMessage,
    clearSuccess: () => setSuccessMessage(null),
  };
};
