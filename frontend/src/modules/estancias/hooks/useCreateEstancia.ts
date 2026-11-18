import { useState } from "react";
import { createEstancia } from "../services";
import { EstanciaCreateRequest } from "../types";

export const useCreateEstancia = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: EstanciaCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createEstancia(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear la estancia.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
