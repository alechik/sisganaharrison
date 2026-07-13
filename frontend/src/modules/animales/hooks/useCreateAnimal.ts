import { useState } from "react";
import { createAnimal } from "../services";
import { AnimalCreateRequest } from "../types";

export const useCreateAnimal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: AnimalCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createAnimal(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear el animal.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
