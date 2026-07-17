import { useState } from "react";
import { createEventoSanitario } from "../services";
import { EventoSanitarioCreateRequest } from "../types";

export const useCreateEventoSanitario = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: EventoSanitarioCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createEventoSanitario(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar el evento sanitario.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
