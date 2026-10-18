import { useCallback, useEffect, useState } from "react";
import { getLotes } from "@/modules/lotes/services";

export const useActiveLoteOptions = () => {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLotes({ activo: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" });
      setOptions(response.data.map((lote) => ({ value: String(lote.id), label: lote.nombre })));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los potreros activos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  return { options, loading, error, reload: loadOptions };
};
