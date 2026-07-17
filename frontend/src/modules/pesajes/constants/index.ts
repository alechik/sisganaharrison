export const PESAJE_ROUTES = {
  list: "/pesajes",
  create: "/pesajes/crear",
  detail: (id: number | string) => `/pesajes/${id}`,
} as const;

export const PESAJE_DEFAULT_PAGE_SIZE = 10;

export const PESAJE_SORT_OPTIONS = [
  { value: "fecha", label: "Fecha" },
  { value: "peso", label: "Peso" },
  { value: "created_at", label: "Fecha de registro" },
] as const;
