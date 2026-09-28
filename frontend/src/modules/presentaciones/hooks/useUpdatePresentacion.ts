import { useState } from "react";
import { updatePresentacion } from "../services";
import { PresentacionUpdateRequest } from "../types";

export const useUpdatePresentacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: PresentacionUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await updatePresentacion(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar el presentación.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
