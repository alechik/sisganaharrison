import { useState } from "react";
import { updateCategoriaAnimal } from "../services";
import { CategoriaAnimalUpdateRequest } from "../types";

export const useUpdateCategoriaAnimal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: CategoriaAnimalUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateCategoriaAnimal(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar la categoría.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
