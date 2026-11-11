import { useState } from "react";
import { createTipoIngreso } from "../services";
import { TipoIngresoCreateRequest } from "../types";

export const useCreateTipoIngreso = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: TipoIngresoCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await createTipoIngreso(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear el tipo de ingreso.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
