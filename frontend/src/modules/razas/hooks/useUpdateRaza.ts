import { useState } from "react";
import { updateRaza } from "../services";
import { RazaUpdateRequest } from "../types";

export const useUpdateRaza = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: RazaUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateRaza(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar la raza.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
