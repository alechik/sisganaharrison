import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getVentas } from "../services";
import { Venta, VentaFilters } from "../types";
import { defaultVentaFilters } from "../utils";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

export const useVentas = () => {
  const [filters, setFilters] = useState<VentaFilters>(defaultVentaFilters());
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);

  const fetchVentas = useCallback(async (nextFilters: VentaFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVentas(nextFilters);
      setVentas(response.data);
      setMeta(response.meta);
      setFilters((current) => ({
        ...current,
        page: response.meta.current_page,
      }));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las ventas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVentas(filters);
  }, [
    fetchVentas,
    filters.page,
    filters.per_page,
    filters.cod_venta,
    filters.cliente,
    filters.estado,
    filters.fecha_desde,
    filters.fecha_hasta,
    filters.sort_by,
    filters.sort_dir,
  ]);

  const updateFilters = (partial: Partial<VentaFilters>) => {
    setFilters((current) => ({
      ...current,
      ...partial,
      page: partial.page ?? 1,
    }));
  };

  return {
    ventas,
    loading,
    error,
    meta,
    filters,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    updateFilters,
    refresh: () => fetchVentas(filters),
  };
};
