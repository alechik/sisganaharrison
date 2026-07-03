import { useState } from "react";
import { updateVacuna } from "../services";
import { VacunaUpdateRequest } from "../types";

export const useUpdateVacuna = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: VacunaUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateVacuna(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar la vacuna.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
