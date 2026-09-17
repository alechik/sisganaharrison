import { useState } from "react";
import { createIngreso } from "../services";
import { IngresoCreateRequest } from "../types";

export const useCreateIngreso = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: IngresoCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createIngreso(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar el ingreso.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
