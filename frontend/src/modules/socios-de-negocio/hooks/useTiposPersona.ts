import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getTiposPersona } from "../services";
import { TipoPersona, TipoPersonaFilters } from "../types";
import { defaultTipoPersonaFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export const useTiposPersona = () => {
  const [filters, setFilters] = useState<TipoPersonaFilters>(defaultTipoPersonaFilters());
  const [tipos, setTipos] = useState<TipoPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTipos = useCallback(async (nextFilters: TipoPersonaFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTiposPersona(nextFilters);
      setTipos(response.data);
      setMeta(response.meta);
      setFilters((current) => ({ ...current, page: response.meta.current_page }));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los tipos de persona.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTipos(filters);
  }, [fetchTipos, filters.page, filters.per_page, filters.search, filters.sort_by, filters.sort_dir]);

  return {
    tipos,
    loading,
    error,
    meta,
    filters,
    successMessage,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    updateFilters: (partial: Partial<TipoPersonaFilters>) =>
      setFilters((current) => ({ ...current, ...partial, page: partial.page ?? 1 })),
    refresh: () => fetchTipos(filters),
    showSuccess: (message: string) => setSuccessMessage(message),
    clearSuccess: () => setSuccessMessage(null),
  };
};
