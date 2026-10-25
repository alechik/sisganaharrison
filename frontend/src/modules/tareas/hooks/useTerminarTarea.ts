import { useState } from "react";
import { terminarTarea } from "../services";

export const useTerminarTarea = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      return await terminarTarea(id);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo terminar la tarea.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, setError };
};
