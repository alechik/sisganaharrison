import { useState } from "react";
import { updateOrdenProducto } from "../services";
import { OrdenCompraProductoCreateRequest } from "../types";

export const useUpdateOrdenProducto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: OrdenCompraProductoCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await updateOrdenProducto(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo actualizar la orden de compra de productos.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
