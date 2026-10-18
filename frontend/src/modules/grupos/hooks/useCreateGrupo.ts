import { useState } from "react";
import { createGrupo } from "../services";
import { GrupoCreateRequest } from "../types";

export const useCreateGrupo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: GrupoCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createGrupo(data);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "No se pudo crear el grupo."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
