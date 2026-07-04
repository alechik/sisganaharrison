import { useState } from "react";
import { updateTipoEventoSanitario } from "../services";
import { TipoEventoSanitarioUpdateRequest } from "../types";

export const useUpdateTipoEventoSanitario = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: TipoEventoSanitarioUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateTipoEventoSanitario(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar el tipo de evento sanitario.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
