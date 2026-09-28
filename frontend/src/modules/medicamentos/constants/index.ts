export const MEDICAMENTO_ROUTES = {
  list: "/medicamentos",
  create: "/medicamentos/crear",
  deleted: "/medicamentos/eliminados",
  detail: (id: number | string) => `/medicamentos/${id}`,
  edit: (id: number | string) => `/medicamentos/${id}/editar`,
} as const;

export const MEDICAMENTO_DEFAULT_PAGE_SIZE = 10;

export const MEDICAMENTO_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "precio", label: "Precio" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
