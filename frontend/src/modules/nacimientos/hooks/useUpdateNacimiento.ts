import { useState } from "react";
import { updateNacimiento } from "../services";
import { NacimientoUpdateRequest } from "../types";

export const useUpdateNacimiento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: NacimientoUpdateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await updateNacimiento(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar el nacimiento.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
