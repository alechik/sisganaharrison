import { useState } from "react";
import { updateTipoAlerta } from "../services";
import { TipoAlertaUpdateRequest } from "../types";

export const useUpdateTipoAlerta = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: TipoAlertaUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateTipoAlerta(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar el tipo de alerta.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
