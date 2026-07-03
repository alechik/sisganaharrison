import { useState } from "react";
import { createVacuna } from "../services";
import { VacunaCreateRequest } from "../types";

export const useCreateVacuna = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: VacunaCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createVacuna(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear la vacuna.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
