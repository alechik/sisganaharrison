import { useState } from "react";
import { createPesaje } from "../services";
import { PesajeCreateRequest } from "../types";

export const useCreatePesaje = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: PesajeCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createPesaje(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar el pesaje.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
