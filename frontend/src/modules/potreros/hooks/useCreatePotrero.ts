import { useState } from "react";
import { createPotrero } from "../services";
import { PotreroCreateRequest } from "../types";

export const useCreatePotrero = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: PotreroCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createPotrero(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear el potrero.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
