import { useCallback, useEffect, useState } from "react";
import { getAnimales } from "@/modules/animales/services";
import { formatAnimalLabel, isAreteValido } from "../utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface Options {
  soloConArete?: boolean;
  incluirHembraId?: number;
  incluirMachoId?: number;
}

export const useReproduccionAnimalOptions = ({
  soloConArete = false,
  incluirHembraId,
  incluirMachoId,
}: Options = {}) => {
  const [hembraOptions, setHembraOptions] = useState<SelectOption[]>([]);
  const [machoOptions, setMachoOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const incluirHembra = incluirHembraId && incluirHembraId > 0 ? incluirHembraId : undefined;
  const incluirMacho = incluirMachoId && incluirMachoId > 0 ? incluirMachoId : undefined;

  const loadOptions = useCallback(async () => {
    try {
      setError(null);

      const [hembras, machos] = await Promise.all([
        getAnimales({
          activo: true,
          sexo: "H",
          per_page: 100,
          sort_by: "codigo",
          sort_dir: "asc",
          ...(soloConArete ? { con_arete: true, incluir_id: incluirHembra } : {}),
        }),
        getAnimales({
          activo: true,
          sexo: "M",
          per_page: 100,
          sort_by: "codigo",
          sort_dir: "asc",
          ...(soloConArete ? { con_arete: true, incluir_id: incluirMacho } : {}),
        }),
      ]);

      setHembraOptions(
        hembras.data
          .filter(
            (animal) =>
              animal.activo &&
              animal.sexo === "H" &&
              (!soloConArete || isAreteValido(animal.arete) || animal.id === incluirHembra)
          )
          .map((animal) => ({
            value: String(animal.id),
            label: formatAnimalLabel(animal.codigo, animal.arete),
          }))
      );
      setMachoOptions(
        machos.data
          .filter(
            (animal) =>
              animal.activo &&
              animal.sexo === "M" &&
              (!soloConArete || isAreteValido(animal.arete) || animal.id === incluirMacho)
          )
          .map((animal) => ({
            value: String(animal.id),
            label: formatAnimalLabel(animal.codigo, animal.arete),
          }))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los animales activos.");
    } finally {
      setLoading(false);
    }
  }, [soloConArete, incluirHembra, incluirMacho]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return {
    hembraOptions,
    machoOptions,
    loading,
    error,
    reload: loadOptions,
  };
};
