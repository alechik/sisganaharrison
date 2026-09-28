export const EVENTO_SANITARIO_ROUTES = {
  list: "/eventos-sanitarios",
  create: "/eventos-sanitarios/crear",
  detail: (id: number | string) => `/eventos-sanitarios/${id}`,
} as const;

export const EVENTO_SANITARIO_DEFAULT_PAGE_SIZE = 10;

export const EVENTO_SANITARIO_SORT_OPTIONS = [
  { value: "fecha", label: "Fecha" },
  { value: "total", label: "Total" },
  { value: "created_at", label: "Fecha de registro" },
] as const;
