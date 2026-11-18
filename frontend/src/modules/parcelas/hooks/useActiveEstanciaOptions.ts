import { useCallback, useEffect, useState } from "react";
import { getEstancias } from "@/modules/estancias/services";

export interface EstanciaOption {
  value: string;
  label: string;
}

export const useActiveEstanciaOptions = () => {
  const [options, setOptions] = useState<EstanciaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getEstancias({
        activo: true,
        per_page: 100,
        sort_by: "nombre",
        sort_dir: "asc",
      });

      setOptions(
        response.data.map((estancia) => ({
          value: String(estancia.id),
          label: estancia.nombre,
        }))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las estancias activas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return { options, loading, error, reload: loadOptions };
};
