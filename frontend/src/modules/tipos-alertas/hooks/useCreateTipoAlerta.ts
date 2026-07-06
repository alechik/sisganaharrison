import { useState } from "react";
import { createTipoAlerta } from "../services";
import { TipoAlertaCreateRequest } from "../types";

export const useCreateTipoAlerta = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: TipoAlertaCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createTipoAlerta(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear el tipo de alerta.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
