import { useState } from "react";
import { createTipoSalida } from "../services";
import { TipoSalidaCreateRequest } from "../types";

export const useCreateTipoSalida = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: TipoSalidaCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await createTipoSalida(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear el tipo de salida.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
