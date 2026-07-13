import { useCallback, useEffect, useState } from "react";
import { getRazas } from "@/modules/razas/services";
import { getCategoriasAnimales } from "@/modules/categorias-animales/services";
import { getEstadosProductivos } from "@/modules/estados-productivos/services";
import { getLotes } from "@/modules/lotes/services";
import { getAnimales } from "../services";

export interface SelectOption {
  value: string;
  label: string;
}

export const useAnimalReferenceOptions = (excludeAnimalId?: number) => {
  const [razaOptions, setRazaOptions] = useState<SelectOption[]>([]);
  const [categoriaOptions, setCategoriaOptions] = useState<SelectOption[]>([]);
  const [estadoProductivoOptions, setEstadoProductivoOptions] = useState<SelectOption[]>([]);
  const [loteOptions, setLoteOptions] = useState<SelectOption[]>([]);
  const [parentOptions, setParentOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [razas, categorias, estados, lotes, animales] = await Promise.all([
        getRazas({ estado: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" }),
        getCategoriasAnimales({ activo: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" }),
        getEstadosProductivos({ activo: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" }),
        getLotes({ activo: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" }),
        getAnimales({ activo: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" }),
      ]);

      setRazaOptions(
        razas.data.map((item) => ({ value: String(item.id), label: item.nombre }))
      );
      setCategoriaOptions(
        categorias.data.map((item) => ({ value: String(item.id), label: item.nombre }))
      );
      setEstadoProductivoOptions(
        estados.data.map((item) => ({ value: String(item.id), label: item.nombre }))
      );
      setLoteOptions(
        lotes.data.map((item) => ({ value: String(item.id), label: item.nombre }))
      );
      setParentOptions(
        animales.data
          .filter((item) => item.id !== excludeAnimalId)
          .map((item) => ({
            value: String(item.id),
            label: item.nombre || item.codigo,
          }))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las opciones de referencia.");
    } finally {
      setLoading(false);
    }
  }, [excludeAnimalId]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return {
    razaOptions,
    categoriaOptions,
    estadoProductivoOptions,
    loteOptions,
    parentOptions,
    loading,
    error,
    reload: loadOptions,
  };
};
