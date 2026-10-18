import { useState } from "react";
import {
  deleteCategoriaProducto,
  restoreCategoriaProducto,
  toggleCategoriaProductoStatus,
} from "../services";

type DeleteAction = "delete" | "toggleStatus" | "restore";

export const useDeleteCategoriaProducto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (id: number, action: DeleteAction) => {
    setLoading(true);
    setError(null);

    try {
      switch (action) {
        case "delete":
          return await deleteCategoriaProducto(id);
        case "toggleStatus":
          return await toggleCategoriaProductoStatus(id);
        case "restore":
          return await restoreCategoriaProducto(id);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo completar la acción.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, setError };
};
