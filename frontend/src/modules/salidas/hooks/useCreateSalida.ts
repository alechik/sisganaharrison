import { useState } from "react";
import { createSalida } from "../services";
import { SalidaCreateRequest } from "../types";

export const useCreateSalida = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: SalidaCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createSalida(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar la salida.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
