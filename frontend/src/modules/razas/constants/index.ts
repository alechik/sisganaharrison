export const RAZA_ROUTES = {
  list: "/razas",
  create: "/razas/crear",
  deleted: "/razas/eliminados",
  detail: (id: number | string) => `/razas/${id}`,
  edit: (id: number | string) => `/razas/${id}/editar`,
} as const;

export const RAZA_DEFAULT_PAGE_SIZE = 10;

export const RAZA_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
