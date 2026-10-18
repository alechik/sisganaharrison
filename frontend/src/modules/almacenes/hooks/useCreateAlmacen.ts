import { useState } from "react";
import { createAlmacen } from "../services";
import { AlmacenCreateRequest } from "../types";

export const useCreateAlmacen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: AlmacenCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await createAlmacen(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo crear el almacén. Cada estancia solo puede tener un almacén.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
