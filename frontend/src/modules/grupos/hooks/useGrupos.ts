import { useCallback, useEffect, useState } from "react";
import { isAbortError, useListRequest } from "@/hooks/useListRequest";
import { PaginationMeta } from "@/types/api";
import { getDeletedGrupos, getGrupos } from "../services";
import { Grupo, GrupoFilters } from "../types";
import { defaultGrupoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export const useGrupos = ({
  deleted = false,
  initialFilters = {},
}: { deleted?: boolean; initialFilters?: Partial<GrupoFilters> } = {}) => {
  const [filters, setFilters] = useState<GrupoFilters>({
    ...defaultGrupoFilters(),
    ...initialFilters,
  });
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const { begin, succeed, fail, initialLoading: loading } = useListRequest();
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchGrupos = useCallback(
    async (nextFilters: GrupoFilters) => {
      const signal = begin();
      try {
        setError(null);
        const response = deleted
          ? await getDeletedGrupos({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              lote_id: nextFilters.lote_id,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            }, signal)
          : await getGrupos(nextFilters, signal);
        if (signal.aborted) return;
        setGrupos(response.data);
        setMeta(response.meta);
        succeed(signal);
      } catch (err) {
        if (isAbortError(err) || signal.aborted) return;
        setError("No se pudieron cargar los grupos.");
        fail(signal);
      }
    },
    [deleted, begin, succeed, fail]
  );

  useEffect(() => {
    void fetchGrupos(filters);
  }, [fetchGrupos, filters.page, filters.per_page, filters.search, filters.lote_id, filters.activo, filters.sort_by, filters.sort_dir]);

  return {
    grupos,
    loading,
    error,
    meta,
    filters,
    successMessage,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    updateFilters: (partial: Partial<GrupoFilters>) =>
      setFilters((current) => ({ ...current, ...partial, page: partial.page ?? 1 })),
    refresh: () => fetchGrupos(filters),
    showSuccess: (message: string) => setSuccessMessage(message),
    clearSuccess: () => setSuccessMessage(null),
  };
};
