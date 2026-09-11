import { useState } from "react";
import { createOrdenCompra } from "../services";
import { OrdenCompraCreateRequest } from "../types";

export const useCreateOrdenCompra = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: OrdenCompraCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createOrdenCompra(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo registrar la orden de compra.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
