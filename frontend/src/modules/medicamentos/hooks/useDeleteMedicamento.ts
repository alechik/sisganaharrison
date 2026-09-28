import { useState } from "react";
import { changeMedicamentoStatus, deleteMedicamento, restoreMedicamento } from "../services";

type DeleteAction = "delete" | "toggleStatus" | "restore";

export const useDeleteMedicamento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (id: number, action: DeleteAction) => {
    setLoading(true);
    setError(null);

    try {
      switch (action) {
        case "delete":
          return await deleteMedicamento(id);
        case "toggleStatus":
          return await changeMedicamentoStatus(id);
        case "restore":
          return await restoreMedicamento(id);
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
