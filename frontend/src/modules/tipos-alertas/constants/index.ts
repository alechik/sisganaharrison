export const TIPO_ALERTA_ROUTES = {
  list: "/tipos-alertas",
  create: "/tipos-alertas/crear",
  deleted: "/tipos-alertas/eliminados",
  detail: (id: number | string) => `/tipos-alertas/${id}`,
  edit: (id: number | string) => `/tipos-alertas/${id}/editar`,
} as const;

export const TIPO_ALERTA_DEFAULT_PAGE_SIZE = 10;

export const TIPO_ALERTA_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
