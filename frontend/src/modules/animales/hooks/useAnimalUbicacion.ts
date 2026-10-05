import { useCallback, useEffect, useState } from "react";
import { getAnimalUbicacion } from "../services";
import { AnimalUbicacionResponse } from "../types";

export const useAnimalUbicacion = (animalId: number) => {
  const [ubicacion, setUbicacion] = useState<AnimalUbicacionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUbicacion(await getAnimalUbicacion(animalId));
    } catch {
      setUbicacion(null);
      setError("No se pudo cargar la ubicación del animal.");
    } finally {
      setLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ubicacion, loading, error };
};
