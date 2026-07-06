import { useState } from "react";
import { updateTipoMovimiento } from "../services";
import { TipoMovimientoUpdateRequest } from "../types";

export const useUpdateTipoMovimiento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: TipoMovimientoUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateTipoMovimiento(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar el tipo de movimiento.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
