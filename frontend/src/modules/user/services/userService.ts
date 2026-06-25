import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import { User, UserCreateRequest, UserListParams, UserUpdateRequest } from "../types/user";

interface LaravelPaginatedResponse<T> {
  data: T[];
  meta: PaginatedResponse<T>["meta"];
  links: PaginatedResponse<T>["links"];
}

const mapPaginated = <T>(response: LaravelPaginatedResponse<T>): PaginatedResponse<T> => ({
  data: response.data,
  meta: response.meta,
  links: response.links,
});

export const getUsers = async (
  params: UserListParams = {}
): Promise<PaginatedResponse<User>> => {
  const response = await api.get<LaravelPaginatedResponse<User>>("/usuarios", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      estado: params.estado,
    },
  });

  return mapPaginated(response.data);
};

export const getDeletedUsers = async (
  params: Pick<UserListParams, "page" | "per_page"> = {}
): Promise<PaginatedResponse<User>> => {
  const response = await api.get<LaravelPaginatedResponse<User>>("/usuarios/eliminados", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
    },
  });

  return mapPaginated(response.data);
};

export const getUser = async (id: number): Promise<User> => {
  const response = await api.get<{ data: User }>(`/usuarios/${id}`);
  return response.data.data;
};

export const createUser = async (data: UserCreateRequest) => {
  const response = await api.post("/usuarios", data);
  return response.data;
};

export const updateUser = async (id: number, data: UserUpdateRequest) => {
  const response = await api.put(`/usuarios/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};

export const changeUserStatus = async (id: number) => {
  const response = await api.patch(`/usuarios/${id}/estado`);
  return response.data;
};

export const restoreUser = async (id: number) => {
  const response = await api.post(`/usuarios/${id}/restaurar`);
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get("/roles");
  return response.data;
};
