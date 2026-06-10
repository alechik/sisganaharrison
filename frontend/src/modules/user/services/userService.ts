import api from "@/api/axios";
import { User, UserCreateRequest } from "../types/user";

export interface UserResponse {
  data: User[];
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<UserResponse>("/usuarios");

  return response.data.data;
};

export const createUser = async (
  data: UserCreateRequest
) => {
  const response = await api.post("/usuarios", data);
  return response.data;
};

export const updateUser = async (
  id: number,
  data: User
) => {
  const response = await api.put(`/usuarios/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get("/roles");
  return response.data;
};