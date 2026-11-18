import { useCallback, useEffect, useState } from "react";
import { getParcelas } from "@/modules/parcelas/services";

export interface ParcelaOption {
  value: string;
  label: string;
}

export const useActiveParcelaOptions = () => {
  const [options, setOptions] = useState<ParcelaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getParcelas({
        activo: true,
        per_page: 100,
        sort_by: "nombre",
        sort_dir: "asc",
      });

      setOptions(
        response.data.map((parcela) => ({
          value: String(parcela.id),
          label: parcela.nombre,
        }))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las parcelas activas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return { options, loading, error, reload: loadOptions };
};
