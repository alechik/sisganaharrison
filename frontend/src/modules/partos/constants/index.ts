export const PARTO_ROUTES = {
  list: "/partos",
  create: "/partos/crear",
  detail: (id: number | string) => `/partos/${id}`,
  edit: (id: number | string) => `/partos/${id}/editar`,
} as const;

export const PARTO_DEFAULT_PAGE_SIZE = 10;

export const PARTO_SORT_OPTIONS = [
  { value: "fecha_parto", label: "Fecha de parto" },
  { value: "created_at", label: "Fecha de registro" },
] as const;
