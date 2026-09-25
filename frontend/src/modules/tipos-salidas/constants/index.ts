export const TIPO_SALIDA_ROUTES = {
  list: "/tipos-salidas",
  create: "/tipos-salidas/crear",
  deleted: "/tipos-salidas/eliminados",
  detail: (id: number | string) => `/tipos-salidas/${id}`,
  edit: (id: number | string) => `/tipos-salidas/${id}/editar`,
} as const;

export const TIPO_SALIDA_DEFAULT_PAGE_SIZE = 10;

export const TIPO_SALIDA_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
