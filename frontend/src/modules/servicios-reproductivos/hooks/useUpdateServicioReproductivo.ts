import { useState } from "react";
import { updateServicioReproductivo } from "../services";
import { ServicioReproductivoUpdateRequest } from "../types";
import { extractApiError } from "../utils";

export const useUpdateServicioReproductivo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: ServicioReproductivoUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateServicioReproductivo(id, data);
      return response;
    } catch (err: unknown) {
      const message = extractApiError(err, "No se pudo actualizar el servicio reproductivo.");
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
