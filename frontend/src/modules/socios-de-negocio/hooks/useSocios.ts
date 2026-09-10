import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getDeletedSocios, getSocios } from "../services";
import { Socio, SocioFilters } from "../types";
import { defaultSocioFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseSociosOptions {
  deleted?: boolean;
  initialFilters?: Partial<SocioFilters>;
}

export const useSocios = ({ deleted = false, initialFilters = {} }: UseSociosOptions = {}) => {
  const [filters, setFilters] = useState<SocioFilters>({
    ...defaultSocioFilters(),
    ...initialFilters,
  });
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSocios = useCallback(async (nextFilters: SocioFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = deleted
        ? await getDeletedSocios({
            page: nextFilters.page,
            per_page: nextFilters.per_page,
            sort_by: nextFilters.sort_by,
            sort_dir: nextFilters.sort_dir,
          })
        : await getSocios(nextFilters);

      setSocios(response.data);
      setMeta(response.meta);
      setFilters((current) => ({
        ...current,
        page: response.meta.current_page,
      }));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los socios de negocio.");
    } finally {
      setLoading(false);
    }
  }, [deleted]);

  useEffect(() => {
    fetchSocios(filters);
  }, [
    fetchSocios,
    filters.page,
    filters.per_page,
    filters.search,
    filters.documento,
    filters.estado,
    filters.tipo,
    filters.tipo_id,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<SocioFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchSocios(filters);

  return {
    socios,
    loading,
    error,
    meta,
    filters,
    successMessage,
    setPage,
    updateFilters,
    refresh,
    showSuccess: (message: string) => setSuccessMessage(message),
    clearSuccess: () => setSuccessMessage(null),
  };
};
