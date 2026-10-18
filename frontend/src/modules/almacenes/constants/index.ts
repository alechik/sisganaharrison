export const ALMACEN_ROUTES = {
  list: "/almacenes",
  create: "/almacenes/crear",
  deleted: "/almacenes/eliminados",
  detail: (id: number | string) => `/almacenes/${id}`,
  edit: (id: number | string) => `/almacenes/${id}/editar`,
} as const;

export const ALMACEN_DEFAULT_PAGE_SIZE = 10;

export const ALMACEN_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
