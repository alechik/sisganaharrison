export const TIPO_MOVIMIENTO_ROUTES = {
  list: "/tipos-movimientos",
  create: "/tipos-movimientos/crear",
  deleted: "/tipos-movimientos/eliminados",
  detail: (id: number | string) => `/tipos-movimientos/${id}`,
  edit: (id: number | string) => `/tipos-movimientos/${id}/editar`,
} as const;

export const TIPO_MOVIMIENTO_DEFAULT_PAGE_SIZE = 10;

export const TIPO_MOVIMIENTO_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
