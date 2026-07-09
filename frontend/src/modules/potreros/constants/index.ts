export const POTRERO_ROUTES = {
  list: "/potreros",
  create: "/potreros/crear",
  deleted: "/potreros/eliminados",
  detail: (id: number | string) => `/potreros/${id}`,
  edit: (id: number | string) => `/potreros/${id}/editar`,
} as const;

export const POTRERO_DEFAULT_PAGE_SIZE = 10;

export const POTRERO_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
