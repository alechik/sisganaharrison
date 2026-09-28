import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getDeletedMedicamentos, getMedicamentos } from "../services";
import { Medicamento, MedicamentoFilters } from "../types";
import { defaultMedicamentoFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseMedicamentosOptions {
  deleted?: boolean;
  initialFilters?: Partial<MedicamentoFilters>;
}

export const useMedicamentos = ({
  deleted = false,
  initialFilters = {},
}: UseMedicamentosOptions = {}) => {
  const [filters, setFilters] = useState<MedicamentoFilters>({
    ...defaultMedicamentoFilters(),
    ...initialFilters,
  });
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchMedicamentos = useCallback(
    async (nextFilters: MedicamentoFilters) => {
      try {
        setLoading(true);
        setError(null);

        const response = deleted
          ? await getDeletedMedicamentos({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            })
          : await getMedicamentos(nextFilters);

        setMedicamentos(response.data);
        setMeta(response.meta);
        setFilters((current) => ({
          ...current,
          page: response.meta.current_page,
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las medicamentos.");
      } finally {
        setLoading(false);
      }
    },
    [deleted]
  );

  useEffect(() => {
    fetchMedicamentos(filters);
  }, [
    fetchMedicamentos,
    filters.page,
    filters.per_page,
    filters.search,
    filters.activo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<MedicamentoFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchMedicamentos(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    medicamentos,
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
