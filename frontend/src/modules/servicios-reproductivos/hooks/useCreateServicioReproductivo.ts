import { useState } from "react";
import { createServicioReproductivo } from "../services";
import { ServicioReproductivoCreateRequest } from "../types";

export const useCreateServicioReproductivo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: ServicioReproductivoCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createServicioReproductivo(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar el servicio reproductivo.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
