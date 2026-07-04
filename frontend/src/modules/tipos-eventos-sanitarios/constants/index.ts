export const TIPO_EVENTO_SANITARIO_ROUTES = {
  list: "/tipos-eventos-sanitarios",
  create: "/tipos-eventos-sanitarios/crear",
  deleted: "/tipos-eventos-sanitarios/eliminados",
  detail: (id: number | string) => `/tipos-eventos-sanitarios/${id}`,
  edit: (id: number | string) => `/tipos-eventos-sanitarios/${id}/editar`,
} as const;

export const TIPO_EVENTO_SANITARIO_DEFAULT_PAGE_SIZE = 10;

export const TIPO_EVENTO_SANITARIO_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
