import { useState } from "react";
import { createGestacion } from "../services";
import { GestacionCreateRequest } from "../types";

export const useCreateGestacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: GestacionCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createGestacion(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar la gestación.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
