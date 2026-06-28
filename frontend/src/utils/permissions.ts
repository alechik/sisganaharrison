const PERMISSIONS_KEY = "permissions";

export const savePermissions = (permissions: string[]): void => {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
};

export const getPermissions = (): string[] => {
  const stored = localStorage.getItem(PERMISSIONS_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

export const hasPermission = (permission: string): boolean => {
  return getPermissions().includes(permission);
};

export const hasAnyPermission = (permissions: string[]): boolean => {
  const current = getPermissions();
  return permissions.some((permission) => current.includes(permission));
};

export const clearPermissions = (): void => {
  localStorage.removeItem(PERMISSIONS_KEY);
};
