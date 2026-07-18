import { useState } from "react";
import { createNacimiento } from "../services";
import { NacimientoCreateRequest } from "../types";

export const useCreateNacimiento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: NacimientoCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createNacimiento(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar el nacimiento.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
