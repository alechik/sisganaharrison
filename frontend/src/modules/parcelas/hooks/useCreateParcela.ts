import { useState } from "react";
import { createParcela } from "../services";
import { ParcelaCreateRequest } from "../types";

export const useCreateParcela = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: ParcelaCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createParcela(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear la parcela.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
