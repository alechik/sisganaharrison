import { useCallback, useEffect, useState } from "react";
import { getEstablecimientos } from "@/modules/establecimientos/services";

export interface EstablecimientoOption {
  value: string;
  label: string;
}

export const useActiveEstablecimientoOptions = () => {
  const [options, setOptions] = useState<EstablecimientoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getEstablecimientos({
        activo: true,
        per_page: 100,
        sort_by: "nombre",
        sort_dir: "asc",
      });

      setOptions(
        response.data.map((establecimiento) => ({
          value: String(establecimiento.id),
          label: establecimiento.nombre,
        }))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los establecimientos activos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return { options, loading, error, reload: loadOptions };
};
