export const ESTABLECIMIENTO_ROUTES = {
  list: "/establecimientos",
  create: "/establecimientos/crear",
  deleted: "/establecimientos/eliminados",
  detail: (id: number | string) => `/establecimientos/${id}`,
  edit: (id: number | string) => `/establecimientos/${id}/editar`,
} as const;

export const ESTABLECIMIENTO_DEFAULT_PAGE_SIZE = 10;

export const ESTABLECIMIENTO_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "departamento", label: "Departamento" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
