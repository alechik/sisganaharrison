import { useState } from "react";
import {
  changeCategoriaAnimalStatus,
  deleteCategoriaAnimal,
  restoreCategoriaAnimal,
} from "../services";

type DeleteAction = "delete" | "toggleStatus" | "restore";

export const useDeleteCategoriaAnimal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (id: number, action: DeleteAction) => {
    setLoading(true);
    setError(null);

    try {
      switch (action) {
        case "delete":
          return await deleteCategoriaAnimal(id);
        case "toggleStatus":
          return await changeCategoriaAnimalStatus(id);
        case "restore":
          return await restoreCategoriaAnimal(id);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo completar la acción.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, setError };
};
