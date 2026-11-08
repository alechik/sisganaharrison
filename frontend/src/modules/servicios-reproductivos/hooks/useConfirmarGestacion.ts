import { useState } from "react";
import { confirmarGestacionServicio } from "../services";
import { ConfirmarGestacionRequest } from "../types";
import { extractApiError } from "../utils";

export const useConfirmarGestacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmar = async (id: number, data: ConfirmarGestacionRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await confirmarGestacionServicio(id, data);
    } catch (err: unknown) {
      const message = extractApiError(err, "No se pudo confirmar la gestación.");
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { confirmar, loading, error, setError };
};
