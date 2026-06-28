import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getCategoriasAnimales, getDeletedCategoriasAnimales } from "../services";
import { CategoriaAnimal, CategoriaAnimalFilters } from "../types";
import { defaultCategoriaAnimalFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseCategoriasAnimalesOptions {
  deleted?: boolean;
  initialFilters?: Partial<CategoriaAnimalFilters>;
}

export const useCategoriasAnimales = ({
  deleted = false,
  initialFilters = {},
}: UseCategoriasAnimalesOptions = {}) => {
  const [filters, setFilters] = useState<CategoriaAnimalFilters>({
    ...defaultCategoriaAnimalFilters(),
    ...initialFilters,
  });
  const [categorias, setCategorias] = useState<CategoriaAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCategorias = useCallback(
    async (nextFilters: CategoriaAnimalFilters) => {
      try {
        setLoading(true);
        setError(null);

        const response = deleted
          ? await getDeletedCategoriasAnimales({
              page: nextFilters.page,
              per_page: nextFilters.per_page,
              sort_by: nextFilters.sort_by,
              sort_dir: nextFilters.sort_dir,
            })
          : await getCategoriasAnimales(nextFilters);

        setCategorias(response.data);
        setMeta(response.meta);
        setFilters((current) => ({
          ...current,
          page: response.meta.current_page,
        }));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las categorías.");
      } finally {
        setLoading(false);
      }
    },
    [deleted]
  );

  useEffect(() => {
    fetchCategorias(filters);
  }, [
    fetchCategorias,
    filters.page,
    filters.per_page,
    filters.search,
    filters.activo,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<CategoriaAnimalFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const refresh = () => fetchCategorias(filters);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const clearSuccess = () => setSuccessMessage(null);

  return {
    categorias,
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
