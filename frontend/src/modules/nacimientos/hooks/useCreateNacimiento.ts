import { useState } from "react";
import { createNacimiento } from "../services";
import { NacimientoCreateRequest } from "../types";
import { getApiErrorMessage } from "../utils";

export const useCreateNacimiento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: NacimientoCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createNacimiento(data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "No se pudo registrar el nacimiento."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
