import { useState } from "react";
import { revisarInformeDiario } from "../services";

export const useRevisarInformeDiario = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      return await revisarInformeDiario(id);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const firstError = Object.values(axiosError.response?.data?.errors ?? {})[0]?.[0];
      setError(
        firstError ?? axiosError.response?.data?.message ?? "No se pudo marcar el informe como revisado."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, setError };
};
