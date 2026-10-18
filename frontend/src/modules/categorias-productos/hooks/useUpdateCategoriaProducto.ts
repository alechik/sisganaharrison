import { useState } from "react";
import { updateCategoriaProducto } from "../services";
import { CategoriaProductoCreateRequest } from "../types";

export const useUpdateCategoriaProducto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: CategoriaProductoCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await updateCategoriaProducto(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo actualizar la categoría de producto.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
