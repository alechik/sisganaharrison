import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getCuarentenas } from "../services";
import { Cuarentena, CuarentenaFilters } from "../types";
import { defaultCuarentenaFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export const useCuarentenas = () => {
  const [filters, setFilters] = useState<CuarentenaFilters>(defaultCuarentenaFilters());
  const [cuarentenas, setCuarentenas] = useState<Cuarentena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);

  const fetchCuarentenas = useCallback(async (nextFilters: CuarentenaFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCuarentenas(nextFilters);
      setCuarentenas(response.data);
      setMeta(response.meta);
      setFilters((current) => ({
        ...current,
        page: response.meta.current_page,
      }));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las cuarentenas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCuarentenas(filters);
  }, [
    fetchCuarentenas,
    filters.page,
    filters.per_page,
    filters.cod_compra,
    filters.proveedor_id,
    filters.estado,
    filters.origen,
    filters.fecha,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<CuarentenaFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  return {
    cuarentenas,
    loading,
    error,
    meta,
    filters,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    updateFilters,
    refresh: () => fetchCuarentenas(filters),
  };
};
