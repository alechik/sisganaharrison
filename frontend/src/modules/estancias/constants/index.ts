export const ESTANCIA_ROUTES = {
  list: "/estancias",
  create: "/estancias/crear",
  deleted: "/estancias/eliminados",
  detail: (id: number | string) => `/estancias/${id}`,
  edit: (id: number | string) => `/estancias/${id}/editar`,
} as const;

export const ESTANCIA_DEFAULT_PAGE_SIZE = 10;

export const ESTANCIA_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "departamento", label: "Departamento" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
