import { useState } from "react";
import { createInformeDiario } from "../services";
import { InformeDiarioCreateRequest } from "../types";

export const useCreateInformeDiario = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: InformeDiarioCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await createInformeDiario(data);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const firstError = Object.values(axiosError.response?.data?.errors ?? {})[0]?.[0];
      setError(
        firstError ?? axiosError.response?.data?.message ?? "No se pudo registrar el informe diario."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
