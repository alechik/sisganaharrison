export const GRUPO_ROUTES = {
  list: "/grupos",
  create: "/grupos/crear",
  deleted: "/grupos/eliminados",
  detail: (id: number | string) => `/grupos/${id}`,
  edit: (id: number | string) => `/grupos/${id}/editar`,
} as const;

export const GRUPO_DEFAULT_PAGE_SIZE = 10;

export const GRUPO_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
