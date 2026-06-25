import { useCallback, useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api";
import { getDeletedUsers, getUsers } from "../services/userService";
import { User, UserListParams } from "../types/user";

const defaultMeta: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
};

interface UseUsersOptions {
  deleted?: boolean;
  params?: UserListParams;
}

export const useUsers = ({ deleted = false, params = {} }: UseUsersOptions = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [page, setPage] = useState(params.page ?? 1);

  const perPage = params.per_page ?? 10;

  const fetchUsers = useCallback(async (pageNumber: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = deleted
        ? await getDeletedUsers({ page: pageNumber, per_page: perPage })
        : await getUsers({
            page: pageNumber,
            per_page: perPage,
            search: params.search,
            estado: params.estado,
          });

      setUsers(response.data);
      setMeta(response.meta);
      setPage(response.meta.current_page);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, [deleted, perPage, params.search, params.estado]);

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  return {
    users,
    loading,
    error,
    meta,
    page,
    setPage,
    fetchUsers,
    refresh: () => fetchUsers(page),
  };
};
