export const ESTADO_PRODUCTIVO_ROUTES = {
  list: "/estados-productivos",
  create: "/estados-productivos/crear",
  deleted: "/estados-productivos/eliminados",
  detail: (id: number | string) => `/estados-productivos/${id}`,
  edit: (id: number | string) => `/estados-productivos/${id}/editar`,
} as const;

export const ESTADO_PRODUCTIVO_DEFAULT_PAGE_SIZE = 10;

export const ESTADO_PRODUCTIVO_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
