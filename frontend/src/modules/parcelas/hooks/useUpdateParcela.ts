import { useState } from "react";
import { updateParcela } from "../services";
import { ParcelaUpdateRequest } from "../types";

export const useUpdateParcela = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: ParcelaUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateParcela(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar la parcela.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
