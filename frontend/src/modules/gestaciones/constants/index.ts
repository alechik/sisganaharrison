export const GESTACION_ROUTES = {
  list: "/gestaciones",
  create: "/gestaciones/crear",
  detail: (id: number | string) => `/gestaciones/${id}`,
  edit: (id: number | string) => `/gestaciones/${id}/editar`,
} as const;

export const GESTACION_DEFAULT_PAGE_SIZE = 10;

export const GESTACION_SORT_OPTIONS = [
  { value: "fecha_probable_parto", label: "Fecha probable de parto" },
  { value: "fecha_confirmacion", label: "Fecha de confirmación" },
  { value: "estado", label: "Estado" },
  { value: "created_at", label: "Fecha de registro" },
] as const;

export const ESTADOS_GESTACION = [
  { value: "ACTIVA", label: "Activa" },
  { value: "FINALIZADA", label: "Finalizada" },
  { value: "ABORTADA", label: "Abortada" },
  { value: "PERDIDA", label: "Perdida" },
] as const;
