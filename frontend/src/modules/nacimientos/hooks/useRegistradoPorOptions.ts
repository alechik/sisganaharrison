import { useEffect, useState } from "react";
import { getUsers } from "@/modules/user/services/userService";
import { formatUserOptionLabel } from "../utils";

interface SelectOption {
  value: string;
  label: string;
}

export const useRegistradoPorOptions = () => {
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getUsers({ page: 1, per_page: 100, estado: true });
        setUserOptions([
          { value: "", label: "Sin registrador" },
          ...response.data.map((user) => ({
            value: String(user.id),
            label: formatUserOptionLabel(user),
          })),
        ]);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return { userOptions, loading, error };
};
