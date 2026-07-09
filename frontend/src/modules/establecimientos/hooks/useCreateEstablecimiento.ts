import { useState } from "react";
import { createEstablecimiento } from "../services";
import { EstablecimientoCreateRequest } from "../types";

export const useCreateEstablecimiento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: EstablecimientoCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createEstablecimiento(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear el establecimiento.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
