import { useState } from "react";
import { createTipoEventoSanitario } from "../services";
import { TipoEventoSanitarioCreateRequest } from "../types";

export const useCreateTipoEventoSanitario = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: TipoEventoSanitarioCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createTipoEventoSanitario(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear el tipo de evento sanitario.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
