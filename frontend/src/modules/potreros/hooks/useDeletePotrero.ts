import { useState } from "react";
import { changePotreroStatus, deletePotrero, restorePotrero } from "../services";

type DeleteAction = "delete" | "toggleStatus" | "restore";

export const useDeletePotrero = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (id: number, action: DeleteAction) => {
    setLoading(true);
    setError(null);

    try {
      switch (action) {
        case "delete":
          return await deletePotrero(id);
        case "toggleStatus":
          return await changePotreroStatus(id);
        case "restore":
          return await restorePotrero(id);
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
