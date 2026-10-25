import { useState } from "react";
import { createTarea } from "../services";
import { TareaCreateRequest } from "../types";

export const useCreateTarea = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: TareaCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await createTarea(data);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const firstError = Object.values(axiosError.response?.data?.errors ?? {})[0]?.[0];
      setError(firstError ?? axiosError.response?.data?.message ?? "No se pudo crear la tarea.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
