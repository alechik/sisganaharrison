import { useState } from "react";
import { createEstadoProductivo } from "../services";
import { EstadoProductivoCreateRequest } from "../types";

export const useCreateEstadoProductivo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: EstadoProductivoCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createEstadoProductivo(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear el estado productivo.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
