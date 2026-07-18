import { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchNacimientos = useCallback(async (nextFilters: NacimientoFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNacimientos(nextFilters);
      setNacimientos(response.data);
      setMeta(response.meta);
      setFilters((current) => ({ ...current, page: response.meta.current_page }));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los nacimientos.");
    } finally {
      setLoading(false);
    }
  }, []);

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
    error,
    meta,
    filters,
    successMessage,
    setPage,
    updateFilters,
    clearSuccess,
  };
};
