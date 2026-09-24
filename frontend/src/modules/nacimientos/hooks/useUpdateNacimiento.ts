import { useState } from "react";
import { updateNacimiento } from "../services";
import { NacimientoUpdateRequest } from "../types";
import { getApiErrorMessage } from "../utils";

export const useUpdateNacimiento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: NacimientoUpdateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await updateNacimiento(id, data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "No se pudo actualizar el nacimiento."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
