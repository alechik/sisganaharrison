import { useState } from "react";
import { updateInformeDiario } from "../services";
import { InformeDiarioUpdateRequest } from "../types";

export const useUpdateInformeDiario = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: InformeDiarioUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await updateInformeDiario(id, data);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const firstError = Object.values(axiosError.response?.data?.errors ?? {})[0]?.[0];
      setError(
        firstError ?? axiosError.response?.data?.message ?? "No se pudo actualizar el informe diario."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
