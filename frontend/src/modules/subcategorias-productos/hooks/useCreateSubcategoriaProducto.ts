import { useState } from "react";
import { createSubcategoriaProducto } from "../services";
import { SubcategoriaProductoCreateRequest } from "../types";

export const useCreateSubcategoriaProducto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: SubcategoriaProductoCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await createSubcategoriaProducto(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo crear la subcategoría.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
