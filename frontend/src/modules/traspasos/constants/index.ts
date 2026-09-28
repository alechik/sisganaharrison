export const TRASPASO_ROUTES = {
  list: "/traspasos",
  create: "/traspasos/crear",
  detail: (id: number | string) => `/traspasos/${id}`,
  edit: (id: number | string) => `/traspasos/${id}/editar`,
} as const;

export const TRASPASO_DEFAULT_PAGE_SIZE = 10;

export const TRASPASO_SORT_OPTIONS = [
  { value: "fecha_traspaso", label: "Fecha de traspaso" },
  { value: "created_at", label: "Fecha de registro" },
  { value: "id", label: "ID" },
  { value: "total_peso", label: "Total peso" },
  { value: "monto_total", label: "Monto total" },
] as const;
