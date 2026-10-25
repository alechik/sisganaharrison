import api from "@/api/axios";
import { asStringArray } from "@/utils/roles";
import { Role, RoleUpdateRequest } from "../types";

const unwrapList = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    return Array.isArray(data) ? (data as T[]) : [];
  }
  return [];
};

const normalizeRole = (role: Role): Role => ({
  ...role,
  permissions: asStringArray(role.permissions),
});

export const getRolesCatalog = async (signal?: AbortSignal): Promise<Role[]> => {
  const response = await api.get("/roles", { signal });
  return unwrapList<Role>(response.data).map(normalizeRole);
};

export const getRole = async (id: number): Promise<Role> => {
  const response = await api.get<{ data?: Role } | Role>(`/roles/${id}`);
  const payload = response.data;
  const role = payload && typeof payload === "object" && "data" in payload && payload.data
    ? payload.data
    : (payload as Role);
  return normalizeRole(role);
};

export const getPermissionCatalog = async (): Promise<string[]> => {
  const response = await api.get("/roles/permisos");
  const payload = response.data;
  if (payload && typeof payload === "object" && "data" in payload) {
    return asStringArray(payload.data);
  }
  return asStringArray(payload);
};

export const updateRolePermissions = async (id: number, data: RoleUpdateRequest) => {
  const response = await api.put<{ message: string; data: Role }>(`/roles/${id}`, data);
  return response.data;
};
