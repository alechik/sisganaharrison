import { useState } from "react";
import { updateTraspaso } from "../services";
import { TraspasoUpdateRequest } from "../types";

export const useUpdateTraspaso = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: TraspasoUpdateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await updateTraspaso(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar el traspaso.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
