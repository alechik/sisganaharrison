import { useCallback, useEffect, useState } from "react";
import { getAnimales } from "@/modules/animales/services";
import { formatAnimalLabel } from "../utils";

export interface SelectOption {
  value: string;
  label: string;
}

export const useActiveAnimalOptions = () => {
  const [animalOptions, setAnimalOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const animales = await getAnimales({
        activo: true,
        per_page: 100,
        sort_by: "codigo",
        sort_dir: "asc",
      });

      setAnimalOptions(
        animales.data.map((animal) => ({
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
    animalOptions,
    loading,
    error,
    reload: loadOptions,
  };
};
