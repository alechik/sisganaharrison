import { useState } from "react";
import { finalizarParto } from "../services";

export const useFinalizarParto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalizar = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      return await finalizarParto(id);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo finalizar el parto.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { finalizar, loading, error, setError };
};
