import { useState } from "react";
import { updateLote } from "../services";
import { LoteUpdateRequest } from "../types";

export const useUpdateLote = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: LoteUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateLote(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar el lote.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
