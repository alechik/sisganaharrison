import { useEffect, useState } from "react";
import { getPartos } from "@/modules/partos/services";
import { Parto } from "@/modules/partos/types";
import { formatPartoOptionLabel } from "../utils";

interface SelectOption {
  value: string;
  label: string;
}

export const usePartoOptions = () => {
  const [partoOptions, setPartoOptions] = useState<SelectOption[]>([]);
  const [partos, setPartos] = useState<Parto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPartos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPartos({
          page: 1,
          per_page: 100,
          sort_by: "fecha_parto",
          sort_dir: "desc",
        });
        setPartos(response.data);
        setPartoOptions(
          response.data.map((parto: Parto) => ({
            value: String(parto.id),
            label: formatPartoOptionLabel(parto),
          }))
        );
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los partos.");
      } finally {
        setLoading(false);
      }
    };
    loadPartos();
  }, []);

  return { partoOptions, partos, loading, error };
};
