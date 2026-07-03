export const VACUNA_ROUTES = {
  list: "/vacunas",
  create: "/vacunas/crear",
  deleted: "/vacunas/eliminados",
  detail: (id: number | string) => `/vacunas/${id}`,
  edit: (id: number | string) => `/vacunas/${id}/editar`,
} as const;

export const VACUNA_DEFAULT_PAGE_SIZE = 10;

export const VACUNA_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "laboratorio", label: "Laboratorio" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
