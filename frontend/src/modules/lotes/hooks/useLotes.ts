import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getDeletedLotes, getLotes } from "../services";
import { Lote, LoteFilters } from "../types";
import { defaultLoteFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseLotesOptions {
  deleted?: boolean;
  initialFilters?: Partial<LoteFilters>;
}

export const useLotes = ({
  deleted = false,
  initialFilters = {},
}: UseLotesOptions = {}) => {
  const [filters, setFilters] = useState<LoteFilters>({
    ...defaultLoteFilters(),
    ...initialFilters,
  });
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchLotes = useCallback(
    async (nextFilters: LoteFilters) => {
      try {
        setLoading(true);
        setError(null);

        const response = deleted
          ? await getDeletedLotes({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              potrero_id: nextFilters.potrero_id,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            })
          : await getLotes(nextFilters);

        setLotes(response.data);
        setMeta(response.meta);
        setFilters((current) => ({
          ...current,
          page: response.meta.current_page,
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los lotes.");
      } finally {
        setLoading(false);
      }
    },
    [deleted]
  );

  useEffect(() => {
    fetchLotes(filters);
  }, [
    fetchLotes,
    filters.page,
    filters.per_page,
    filters.search,
    filters.potrero_id,
    filters.activo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<LoteFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchLotes(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    lotes,
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
