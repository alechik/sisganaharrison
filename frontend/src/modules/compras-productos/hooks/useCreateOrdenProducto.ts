import { useState } from "react";
import { createOrdenProducto } from "../services";
import { OrdenCompraProductoCreateRequest } from "../types";

export const useCreateOrdenProducto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: OrdenCompraProductoCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createOrdenProducto(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo registrar la orden de compra de productos.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
