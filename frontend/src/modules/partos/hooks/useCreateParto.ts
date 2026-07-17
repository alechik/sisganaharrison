import { useState } from "react";
import { createParto } from "../services";
import { PartoCreateRequest } from "../types";

export const useCreateParto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: PartoCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createParto(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar el parto.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
