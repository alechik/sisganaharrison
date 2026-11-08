import { useState } from "react";
import { registrarPartoNacimientoServicio } from "../services";
import { RegistrarPartoNacimientoRequest } from "../types";
import { extractApiError } from "../utils";

export const useRegistrarPartoNacimiento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrar = async (id: number, data: RegistrarPartoNacimientoRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await registrarPartoNacimientoServicio(id, data);
    } catch (err: unknown) {
      const message = extractApiError(err, "No se pudo registrar el parto y el nacimiento.");
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registrar, loading, error, setError };
};
