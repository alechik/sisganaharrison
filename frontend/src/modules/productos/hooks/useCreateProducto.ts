import { useState } from "react";
import { createProducto } from "../services";
import { ProductoCreateRequest } from "../types";

export const useCreateProducto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: ProductoCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createProducto(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear la producto.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
