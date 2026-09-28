export const PRESENTACION_ROUTES = {
  list: "/presentaciones",
  create: "/presentaciones/crear",
  deleted: "/presentaciones/eliminados",
  detail: (id: number | string) => `/presentaciones/${id}`,
  edit: (id: number | string) => `/presentaciones/${id}/editar`,
} as const;

export const PRESENTACION_DEFAULT_PAGE_SIZE = 10;

export const PRESENTACION_SORT_OPTIONS = [
  { value: "descripcion", label: "Descripción" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
