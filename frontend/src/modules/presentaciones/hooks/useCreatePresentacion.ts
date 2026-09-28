import { useState } from "react";
import { createPresentacion } from "../services";
import { PresentacionCreateRequest } from "../types";

export const useCreatePresentacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: PresentacionCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await createPresentacion(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear el presentación.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
