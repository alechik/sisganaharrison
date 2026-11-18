export const PARCELA_ROUTES = {
  list: "/parcelas",
  create: "/parcelas/crear",
  deleted: "/parcelas/eliminados",
  detail: (id: number | string) => `/parcelas/${id}`,
  edit: (id: number | string) => `/parcelas/${id}/editar`,
} as const;

export const PARCELA_DEFAULT_PAGE_SIZE = 10;

export const PARCELA_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
