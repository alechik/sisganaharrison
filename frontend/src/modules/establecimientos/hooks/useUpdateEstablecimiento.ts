import { useState } from "react";
import { updateEstablecimiento } from "../services";
import { EstablecimientoUpdateRequest } from "../types";

export const useUpdateEstablecimiento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: EstablecimientoUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateEstablecimiento(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar el establecimiento.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
