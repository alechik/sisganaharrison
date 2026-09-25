export const VENTA_ROUTES = {
  list: "/ventas",
  create: "/ventas/crear",
  detail: (id: number | string) => `/ventas/${id}`,
  edit: (id: number | string) => `/ventas/${id}/editar`,
} as const;

export const VENTA_DEFAULT_PAGE_SIZE = 10;

export const VENTA_ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "AUTORIZADA", label: "Autorizada" },
  { value: "ANULADA", label: "Anulada" },
] as const;

export const VENTA_SORT_OPTIONS = [
  { value: "created_at", label: "Fecha de registro" },
  { value: "fecha_venta", label: "Fecha de venta" },
  { value: "cod_venta", label: "Código" },
  { value: "monto_total", label: "Monto" },
  { value: "estado", label: "Estado" },
] as const;
