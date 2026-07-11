import { useCallback, useEffect, useState } from "react";
import { getPotreros } from "@/modules/potreros/services";

export interface PotreroOption {
  value: string;
  label: string;
}

export const useActivePotreroOptions = () => {
  const [options, setOptions] = useState<PotreroOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPotreros({
        activo: true,
        per_page: 100,
        sort_by: "nombre",
        sort_dir: "asc",
      });

      setOptions(
        response.data.map((potrero) => ({
          value: String(potrero.id),
          label: potrero.nombre,
        }))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los potreros activos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return { options, loading, error, reload: loadOptions };
};
