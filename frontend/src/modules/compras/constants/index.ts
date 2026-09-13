export const ORDEN_COMPRA_ROUTES = {
  list: "/compras/ordenes-compra",
  create: "/compras/ordenes-compra/crear",
  detail: (id: number | string) => `/compras/ordenes-compra/${id}`,
  edit: (id: number | string) => `/compras/ordenes-compra/${id}/editar`,
  pendientes: "/compras/ordenes-compra?estado=PENDIENTE",
} as const;

export const CUARENTENA_ROUTES = {
  list: "/compras/cuarentenas",
  create: "/compras/cuarentenas/crear",
  detail: (id: number | string) => `/compras/cuarentenas/${id}`,
  edit: (id: number | string) => `/compras/cuarentenas/${id}/editar`,
} as const;

export const ORDEN_COMPRA_DEFAULT_PAGE_SIZE = 10;

export const ORDEN_COMPRA_ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "AUTORIZADA", label: "Autorizada" },
  { value: "RECHAZADA", label: "Rechazada" },
] as const;

export const ORDEN_COMPRA_SORT_OPTIONS = [
  { value: "created_at", label: "Fecha de registro" },
  { value: "fecha", label: "Fecha" },
  { value: "cod_compra", label: "Código" },
  { value: "monto_total", label: "Monto" },
  { value: "estado", label: "Estado" },
] as const;

export const CUARENTENA_ESTADOS = [
  { value: "PROCESADO", label: "Procesado" },
  { value: "COMPLETADO", label: "Completado" },
] as const;

export const CUARENTENA_ORIGENES = [
  { value: "ORDEN_COMPRA", label: "Orden de Compra" },
  { value: "DIRECTA", label: "Directa por excepción" },
] as const;

export const CUARENTENA_SORT_OPTIONS = [
  { value: "created_at", label: "Fecha de registro" },
  { value: "fecha_inicio", label: "Fecha de inicio" },
  { value: "cod_compra", label: "Código" },
  { value: "monto_total", label: "Monto" },
  { value: "estado", label: "Estado" },
  { value: "origen", label: "Origen" },
] as const;
