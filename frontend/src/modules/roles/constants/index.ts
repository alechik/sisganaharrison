export const ROLE_ROUTES = {
  list: "/roles",
  detail: (id: number | string) => `/roles/${id}`,
  edit: (id: number | string) => `/roles/${id}/editar`,
} as const;

export const ROLE_LABELS: Record<string, string> = {
  administrador: "Administrador",
  gerencia: "Gerencia",
  trabajador: "Trabajador",
  veterinario: "Veterinario",
};

export const getRoleLabel = (name?: string | null): string => {
  if (!name) {
    return "—";
  }
  return ROLE_LABELS[name] ?? name;
};
