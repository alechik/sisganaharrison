import { useState } from "react";
import { createSocio } from "../services";
import { SocioCreateRequest } from "../types";

export const useCreateSocio = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: SocioCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await createSocio(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar el socio de negocio.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
