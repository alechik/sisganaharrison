import { useState } from "react";
import { updateVenta } from "../services";
import { VentaCreateRequest } from "../types";

export const useUpdateVenta = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: VentaCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await updateVenta(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar la venta.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
