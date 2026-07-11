export const LOTE_ROUTES = {
  list: "/lotes",
  create: "/lotes/crear",
  deleted: "/lotes/eliminados",
  detail: (id: number | string) => `/lotes/${id}`,
  edit: (id: number | string) => `/lotes/${id}/editar`,
} as const;

export const LOTE_DEFAULT_PAGE_SIZE = 10;

export const LOTE_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
