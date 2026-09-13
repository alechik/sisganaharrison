import { useState } from "react";
import { updateCuarentena } from "../services";
import { CuarentenaCreateRequest } from "../types";

export const useUpdateCuarentena = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: CuarentenaCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await updateCuarentena(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar la cuarentena.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
