import { useState } from "react";
import { updateSubcategoriaProducto } from "../services";
import { SubcategoriaProductoCreateRequest } from "../types";

export const useUpdateSubcategoriaProducto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: SubcategoriaProductoCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await updateSubcategoriaProducto(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo actualizar la subcategoría.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
