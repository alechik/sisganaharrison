import { useState } from "react";
import { updateTipoIngreso } from "../services";
import { TipoIngresoUpdateRequest } from "../types";

export const useUpdateTipoIngreso = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: TipoIngresoUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await updateTipoIngreso(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar el tipo de ingreso.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
