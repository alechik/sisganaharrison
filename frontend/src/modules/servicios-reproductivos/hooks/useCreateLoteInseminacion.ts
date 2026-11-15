import { useState } from "react";
import { createLoteInseminacion } from "../services";
import { InseminacionLoteRequest } from "../types";
import { extractApiError } from "../utils";

export const useCreateLoteInseminacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: InseminacionLoteRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await createLoteInseminacion(data);
    } catch (err: unknown) {
      const message = extractApiError(err, "No se pudo registrar la inseminación.");
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
