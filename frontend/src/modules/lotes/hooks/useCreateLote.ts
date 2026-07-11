import { useState } from "react";
import { createLote } from "../services";
import { LoteCreateRequest } from "../types";

export const useCreateLote = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: LoteCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createLote(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear el lote.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
