import { useEffect, useState } from "react";
import { getParto, getPartos } from "@/modules/partos/services";
import { Parto } from "@/modules/partos/types";
import { formatPartoOptionLabel } from "../utils";

interface SelectOption {
  value: string;
  label: string;
}

interface Options {
  soloPendientes?: boolean;
  incluirId?: number;
}

export const usePartoOptions = ({
  soloPendientes = false,
  incluirId,
}: Options = {}) => {
  const [partoOptions, setPartoOptions] = useState<SelectOption[]>([]);
  const [partos, setPartos] = useState<Parto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const incluir = incluirId && incluirId > 0 ? incluirId : undefined;

  useEffect(() => {
    const loadPartos = async () => {
      try {
        setError(null);
        const response = await getPartos({
          page: 1,
          per_page: 100,
          sort_by: "fecha_parto",
          sort_dir: "desc",
          ...(soloPendientes ? { estado: "PENDIENTE" } : {}),
        });

        let data = response.data;

        if (incluir && !data.some((parto) => parto.id === incluir)) {
          try {
            const actual = await getParto(incluir);
            data = [actual, ...data];
          } catch (err) {
            console.error(err);
          }
        }

        setPartos(data);
        setPartoOptions(
          data.map((parto: Parto) => ({
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
  }, [soloPendientes, incluir]);

  return { partoOptions, partos, loading, error };
};
