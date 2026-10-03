import { useCallback, useEffect, useState } from "react";
import { animalHistorialApi } from "../services";
import {
  AnimalHistorialFilters,
  AnimalHistorialItem,
  AnimalHistorialTipo,
} from "../types";

const DEFAULT_PER_PAGE = 50;

interface UseAnimalHistorialOptions {
  animalId: number;
  initialTipos?: AnimalHistorialTipo[];
  perPage?: number;
}

export const useAnimalHistorial = ({
  animalId,
  initialTipos,
  perPage = DEFAULT_PER_PAGE,
}: UseAnimalHistorialOptions) => {
  const [items, setItems] = useState<AnimalHistorialItem[]>([]);
  const [tipos, setTipos] = useState<AnimalHistorialTipo[]>(initialTipos ?? []);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean, nextTipos: AnimalHistorialTipo[]) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const filtros: AnimalHistorialFilters = {
        page: nextPage,
        per_page: perPage,
        tipo: nextTipos.length > 0 ? nextTipos : undefined,
      };

      try {
        const response = await animalHistorialApi.getHistorial(animalId, filtros);
        setTotal(response.meta.total);
        setItems((current) => (append ? [...current, ...response.data] : response.data));
        setPage(nextPage);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el historial del animal.");
        if (!append) {
          setItems([]);
          setTotal(0);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [animalId, perPage]
  );

  useEffect(() => {
    void fetchPage(1, false, tipos);
  }, [fetchPage, tipos]);

  const toggleTipo = (tipo: AnimalHistorialTipo) => {
    setTipos((current) =>
      current.includes(tipo) ? current.filter((item) => item !== tipo) : [...current, tipo]
    );
  };

  const clearTipos = () => setTipos([]);

  const loadMore = () => {
    if (loading || loadingMore || items.length >= total) {
      return;
    }
    void fetchPage(page + 1, true, tipos);
  };

  return {
    items,
    tipos,
    total,
    loading,
    loadingMore,
    error,
    hasMore: items.length < total,
    toggleTipo,
    clearTipos,
    loadMore,
    refresh: () => fetchPage(1, false, tipos),
  };
};
