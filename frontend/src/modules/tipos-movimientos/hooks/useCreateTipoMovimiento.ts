import { useState } from "react";
import { createTipoMovimiento } from "../services";
import { TipoMovimientoCreateRequest } from "../types";

export const useCreateTipoMovimiento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: TipoMovimientoCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createTipoMovimiento(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear el tipo de movimiento.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
