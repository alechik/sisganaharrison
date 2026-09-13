import { useState } from "react";
import { createCuarentena } from "../services";
import { CuarentenaCreateRequest } from "../types";

export const useCreateCuarentena = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CuarentenaCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createCuarentena(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar la cuarentena.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
