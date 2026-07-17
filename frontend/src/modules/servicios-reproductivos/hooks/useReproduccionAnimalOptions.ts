import { useCallback, useEffect, useState } from "react";
import { getAnimales } from "@/modules/animales/services";
import { formatAnimalLabel } from "../utils";

export interface SelectOption {
  value: string;
  label: string;
}

export const useReproduccionAnimalOptions = () => {
  const [hembraOptions, setHembraOptions] = useState<SelectOption[]>([]);
  const [machoOptions, setMachoOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [hembras, machos] = await Promise.all([
        getAnimales({ activo: true, sexo: "H", per_page: 100, sort_by: "codigo", sort_dir: "asc" }),
        getAnimales({ activo: true, sexo: "M", per_page: 100, sort_by: "codigo", sort_dir: "asc" }),
      ]);

      setHembraOptions(
        hembras.data.map((animal) => ({
          value: String(animal.id),
          label: formatAnimalLabel(animal.codigo, animal.arete),
        }))
      );
      setMachoOptions(
        machos.data.map((animal) => ({
          value: String(animal.id),
          label: formatAnimalLabel(animal.codigo, animal.arete),
        }))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los animales activos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return {
    hembraOptions,
    machoOptions,
    loading,
    error,
    reload: loadOptions,
  };
};
