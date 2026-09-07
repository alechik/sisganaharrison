import { useEffect, useState } from "react";
import { getTiposPersonaOptions } from "../services";
import { TipoPersona } from "../types";
import { getTipoLabel } from "../utils";

interface SelectOption {
  value: string;
  label: string;
  text: string;
}

export const useTipoPersonaOptions = () => {
  const [tipoOptions, setTipoOptions] = useState<SelectOption[]>([]);
  const [tipos, setTipos] = useState<TipoPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTiposPersonaOptions();
        setTipos(data);
        setTipoOptions(
          data.map((tipo) => ({
            value: String(tipo.id),
            label: getTipoLabel(tipo.nombre),
            text: getTipoLabel(tipo.nombre),
          }))
        );
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los tipos de persona.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { tipoOptions, tipos, loading, error };
};
