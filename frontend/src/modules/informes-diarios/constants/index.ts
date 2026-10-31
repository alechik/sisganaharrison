export const INFORME_DIARIO_ROUTES = {
  list: "/informes-diarios",
  create: "/informes-diarios/crear",
  pendientes: "/informes-diarios?revisado=NO",
  detail: (id: number | string) => `/informes-diarios/${id}`,
  edit: (id: number | string) => `/informes-diarios/${id}/editar`,
} as const;

export const INFORME_DIARIO_DEFAULT_PAGE_SIZE = 10;

export const INFORME_SORT_OPTIONS = [
  { value: "fecha", label: "Fecha" },
  { value: "codigo_informe", label: "Código" },
  { value: "revisado", label: "Revisado" },
  { value: "created_at", label: "Fecha de creación" },
] as const;

export const INFORME_REVISADO_OPTIONS = [
  { value: "NO", label: "No revisado" },
  { value: "SI", label: "Revisado" },
] as const;
