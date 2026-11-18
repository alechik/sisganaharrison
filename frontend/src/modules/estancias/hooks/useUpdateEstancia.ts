import { useState } from "react";
import { updateEstancia } from "../services";
import { EstanciaUpdateRequest } from "../types";

export const useUpdateEstancia = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: EstanciaUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateEstancia(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar la estancia.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
