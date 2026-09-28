import { useState } from "react";
import { deletePresentacion, restorePresentacion } from "../services";

type DeleteAction = "delete" | "restore";

export const useDeletePresentacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (id: number, action: DeleteAction) => {
    setLoading(true);
    setError(null);

    try {
      return action === "delete"
        ? await deletePresentacion(id)
        : await restorePresentacion(id);
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
