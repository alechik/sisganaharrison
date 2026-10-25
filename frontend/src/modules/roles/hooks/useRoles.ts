import { useCallback, useEffect, useState } from "react";
import { getRolesCatalog } from "../services";
import { Role } from "../types";

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const data = await getRolesCatalog();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    successMessage,
    refresh: fetchRoles,
    showSuccess: setSuccessMessage,
    clearSuccess: () => setSuccessMessage(null),
  };
};
