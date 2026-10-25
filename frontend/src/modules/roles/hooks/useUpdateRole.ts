import { useState } from "react";
import { updateRolePermissions } from "../services";
import { RoleUpdateRequest } from "../types";

export const useUpdateRole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: RoleUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      return await updateRolePermissions(id, data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudieron actualizar los permisos del rol.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
