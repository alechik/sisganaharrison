import { useState } from "react";
import { createTraspaso } from "../services";
import { TraspasoCreateRequest } from "../types";

export const useCreateTraspaso = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: TraspasoCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createTraspaso(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar el traspaso.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
