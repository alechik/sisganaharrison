import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getPesajes } from "../services";
import { Pesaje, PesajeFilters } from "../types";
import { defaultPesajeFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UsePesajesOptions {
  initialFilters?: Partial<PesajeFilters>;
}

export const usePesajes = ({ initialFilters = {} }: UsePesajesOptions = {}) => {
  const [filters, setFilters] = useState<PesajeFilters>({
    ...defaultPesajeFilters(),
    ...initialFilters,
  });
  const [pesajes, setPesajes] = useState<Pesaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPesajes = useCallback(async (nextFilters: PesajeFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPesajes(nextFilters);

      setPesajes(response.data);
      setMeta(response.meta);
      setFilters((current) => ({
        ...current,
        page: response.meta.current_page,
      }));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los pesajes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPesajes(filters);
  }, [
    fetchPesajes,
    filters.page,
    filters.per_page,
    filters.search,
    filters.animal_id,
    filters.fecha_desde,
    filters.fecha_hasta,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<PesajeFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchPesajes(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    pesajes,
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
