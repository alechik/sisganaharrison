import { useState } from "react";
import { updateOrdenCompra } from "../services";
import { OrdenCompraCreateRequest } from "../types";

export const useUpdateOrdenCompra = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: OrdenCompraCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await updateOrdenCompra(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar la orden de compra.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
