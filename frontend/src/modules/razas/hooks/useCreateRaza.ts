import { useState } from "react";
import { createRaza } from "../services";
import { RazaCreateRequest } from "../types";

export const useCreateRaza = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: RazaCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createRaza(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear la raza.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
