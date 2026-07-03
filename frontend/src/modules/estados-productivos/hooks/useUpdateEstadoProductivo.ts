import { useState } from "react";
import { updateEstadoProductivo } from "../services";
import { EstadoProductivoUpdateRequest } from "../types";

export const useUpdateEstadoProductivo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: EstadoProductivoUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateEstadoProductivo(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar el estado productivo.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
