import { useState } from "react";
import { changeGrupoStatus, deleteGrupo, restoreGrupo } from "../services";

type DeleteAction = "delete" | "toggleStatus" | "restore";

export const useDeleteGrupo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (id: number, action: DeleteAction) => {
    setLoading(true);
    setError(null);
    try {
      if (action === "delete") return await deleteGrupo(id);
      if (action === "toggleStatus") return await changeGrupoStatus(id);
      return await restoreGrupo(id);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "No se pudo completar la acción."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, setError };
};
