import { useCallback, useEffect, useState } from "react";
import { getAnimales } from "@/modules/animales/services";
import { getTiposEventosSanitarios } from "@/modules/tipos-eventos-sanitarios/services";
import { getVacunas } from "@/modules/vacunas/services";
import { formatAnimalLabel } from "../utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface TipoEventoOption extends SelectOption {
  codigo: string;
}

export const useSanitarioReferenceOptions = () => {
  const [animalOptions, setAnimalOptions] = useState<SelectOption[]>([]);
  const [tipoEventoOptions, setTipoEventoOptions] = useState<TipoEventoOption[]>([]);
  const [vacunaOptions, setVacunaOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [animales, tipos, vacunas] = await Promise.all([
        getAnimales({ activo: true, per_page: 100, sort_by: "codigo", sort_dir: "asc" }),
        getTiposEventosSanitarios({
          activo: true,
          per_page: 100,
          sort_by: "nombre",
          sort_dir: "asc",
        }),
        getVacunas({ activo: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" }),
      ]);

      setAnimalOptions(
        animales.data.map((animal) => ({
          value: String(animal.id),
          label: formatAnimalLabel(animal.codigo, animal.arete),
        }))
      );
      setTipoEventoOptions(
        tipos.data.map((tipo) => ({
          value: String(tipo.id),
          label: tipo.nombre,
          codigo: tipo.codigo,
        }))
      );
      setVacunaOptions(
        vacunas.data.map((vacuna) => ({
          value: String(vacuna.id),
          label: vacuna.nombre,
        }))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las opciones de referencia.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return {
    animalOptions,
    tipoEventoOptions,
    vacunaOptions,
    loading,
    error,
    reload: loadOptions,
  };
};
