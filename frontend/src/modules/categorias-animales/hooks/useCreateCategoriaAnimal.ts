import { useState } from "react";
import { createCategoriaAnimal } from "../services";
import { CategoriaAnimalCreateRequest } from "../types";

export const useCreateCategoriaAnimal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CategoriaAnimalCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createCategoriaAnimal(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear la categoría.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
