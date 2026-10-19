export const ORDEN_PRODUCTO_ROUTES = {
  list: "/compras-productos/ordenes",
  create: "/compras-productos/ordenes/crear",
  detail: (id: number | string) => `/compras-productos/ordenes/${id}`,
  edit: (id: number | string) => `/compras-productos/ordenes/${id}/editar`,
  pendientes: "/compras-productos/ordenes?estado=PENDIENTE",
} as const;

export const ORDEN_PRODUCTO_DEFAULT_PAGE_SIZE = 10;

export const ORDEN_PRODUCTO_ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "AUTORIZADO", label: "Autorizado" },
  { value: "CANCELADO", label: "Cancelado" },
] as const;

export const ORDEN_PRODUCTO_SORT_OPTIONS = [
  { value: "created_at", label: "Fecha de registro" },
  { value: "fecha", label: "Fecha" },
  { value: "cod_compra", label: "Código" },
  { value: "monto_total", label: "Monto" },
  { value: "estado", label: "Estado" },
] as const;

export const INGRESO_PRODUCTO_ROUTES = {
  list: "/compras-productos/ingresos",
  create: "/compras-productos/ingresos/crear",
  detail: (id: number | string) => `/compras-productos/ingresos/${id}`,
} as const;

export const INGRESO_PRODUCTO_DEFAULT_PAGE_SIZE = 10;

export const INGRESO_PRODUCTO_SORT_OPTIONS = [
  { value: "created_at", label: "Fecha de registro" },
  { value: "fecha", label: "Fecha de ingreso" },
  { value: "cod_ingreso", label: "Código" },
  { value: "monto_total", label: "Monto" },
] as const;
