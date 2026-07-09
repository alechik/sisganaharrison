import { useState } from "react";
import { updatePotrero } from "../services";
import { PotreroUpdateRequest } from "../types";

export const useUpdatePotrero = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: PotreroUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updatePotrero(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar el potrero.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
