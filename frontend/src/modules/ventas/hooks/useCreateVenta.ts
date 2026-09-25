import { useState } from "react";
import { createVenta } from "../services";
import { VentaCreateRequest } from "../types";

export const useCreateVenta = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: VentaCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createVenta(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar la venta.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
