import { useEffect, useState } from "react";
import { getAnimales } from "@/modules/animales/services";
import { formatAnimalOptionLabel } from "../utils";

interface SelectOption {
  value: string;
  label: string;
}

export const useAnimalOptions = () => {
  const [animalOptions, setAnimalOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnimales = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAnimales({
          page: 1,
          per_page: 100,
          activo: true,
          sort_by: "codigo",
          sort_dir: "asc",
        });
        setAnimalOptions([
          { value: "", label: "Sin animal vinculado" },
          ...response.data.map((animal) => ({
            value: String(animal.id),
            label: formatAnimalOptionLabel(animal),
          })),
        ]);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los animales.");
      } finally {
        setLoading(false);
      }
    };
    loadAnimales();
  }, []);

  return { animalOptions, loading, error };
};
