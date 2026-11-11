export const TIPO_INGRESO_ROUTES = {
  list: "/tipos-ingresos",
  create: "/tipos-ingresos/crear",
  deleted: "/tipos-ingresos/eliminados",
  detail: (id: number | string) => `/tipos-ingresos/${id}`,
  edit: (id: number | string) => `/tipos-ingresos/${id}/editar`,
} as const;

export const TIPO_INGRESO_DEFAULT_PAGE_SIZE = 10;

export const TIPO_INGRESO_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "iniciales", label: "Iniciales" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
