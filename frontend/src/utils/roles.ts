import { hasPermission } from "./permissions";

const ROLES_KEY = "roles";

export const GESTORES_ROLES = ["administrador", "gerencia"] as const;
export const ASIGNABLES_TAREA = ["trabajador", "veterinario"] as const;

export const saveRoles = (roles: string[]): void => {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
};

export const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (value && typeof value === "object") {
    return Object.values(value).filter((item): item is string => typeof item === "string");
  }
  return [];
};

export const getStoredRoles = (): string[] => {
  const stored = localStorage.getItem(ROLES_KEY);

  if (!stored) {
    return [];
  }

  try {
    return asStringArray(JSON.parse(stored));
  } catch {
    return [];
  }
};

export const hasRole = (role: string): boolean => {
  return getStoredRoles().includes(role);
};

export const hasAnyRole = (roles: readonly string[]): boolean => {
  const current = getStoredRoles();
  return roles.some((role) => current.includes(role));
};

export const canManageRoles = (): boolean =>
  hasAnyRole(GESTORES_ROLES) || hasPermission("roles.view") || hasPermission("roles.update");

export const canManageTareas = (): boolean =>
  hasAnyRole(GESTORES_ROLES) || hasPermission("tareas.create");

export const canReceiveTareas = (): boolean =>
  hasAnyRole(ASIGNABLES_TAREA) || hasPermission("tareas.update") || hasPermission("tareas.complete");

export const canEditRole = (roleName?: string | null): boolean => {
  if (!canManageRoles()) {
    return false;
  }
  if (roleName === "administrador") {
    return hasRole("administrador");
  }
  return true;
};

export const clearRoles = (): void => {
  localStorage.removeItem(ROLES_KEY);
};
