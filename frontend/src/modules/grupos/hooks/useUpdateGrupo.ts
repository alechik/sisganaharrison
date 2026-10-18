import { useState } from "react";
import { updateGrupo } from "../services";
import { GrupoUpdateRequest } from "../types";

export const useUpdateGrupo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: GrupoUpdateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await updateGrupo(id, data);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "No se pudo actualizar el grupo."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
