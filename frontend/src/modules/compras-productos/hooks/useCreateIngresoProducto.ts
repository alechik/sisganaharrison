import { useState } from "react";
import { createIngresoProducto } from "../services";
import { IngresoProductoCreateRequest } from "../types";

export const useCreateIngresoProducto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: IngresoProductoCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createIngresoProducto(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo registrar el ingreso de productos.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
