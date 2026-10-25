import { useState } from "react";
import { updateTarea } from "../services";
import { TareaUpdateRequest } from "../types";

export const useUpdateTarea = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: TareaUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await updateTarea(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar la respuesta.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
