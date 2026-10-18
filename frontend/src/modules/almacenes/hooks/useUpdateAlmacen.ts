import { useState } from "react";
import { updateAlmacen } from "../services";
import { AlmacenCreateRequest } from "../types";

export const useUpdateAlmacen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: AlmacenCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await updateAlmacen(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo actualizar el almacén.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
