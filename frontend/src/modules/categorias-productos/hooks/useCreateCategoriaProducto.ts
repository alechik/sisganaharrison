import { useState } from "react";
import { createCategoriaProducto } from "../services";
import { CategoriaProductoCreateRequest } from "../types";

export const useCreateCategoriaProducto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CategoriaProductoCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await createCategoriaProducto(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo crear la categoría de producto.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
