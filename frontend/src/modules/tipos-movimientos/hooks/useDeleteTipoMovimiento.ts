import { useState } from "react";
import {
  changeTipoMovimientoStatus,
  deleteTipoMovimiento,
  restoreTipoMovimiento,
} from "../services";

type DeleteAction = "delete" | "toggleStatus" | "restore";

export const useDeleteTipoMovimiento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (id: number, action: DeleteAction) => {
    setLoading(true);
    setError(null);

    try {
      switch (action) {
        case "delete":
          return await deleteTipoMovimiento(id);
        case "toggleStatus":
          return await changeTipoMovimientoStatus(id);
        case "restore":
          return await restoreTipoMovimiento(id);
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
