import { useState } from "react";
import { deleteTipoSalida, restoreTipoSalida } from "../services";

type DeleteAction = "delete" | "restore";

export const useDeleteTipoSalida = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (id: number, action: DeleteAction) => {
    setLoading(true);
    setError(null);

    try {
      return action === "delete"
        ? await deleteTipoSalida(id)
        : await restoreTipoSalida(id);
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
