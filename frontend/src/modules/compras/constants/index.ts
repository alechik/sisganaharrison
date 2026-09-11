export const ORDEN_COMPRA_ROUTES = {
  list: "/compras/ordenes-compra",
  create: "/compras/ordenes-compra/crear",
  detail: (id: number | string) => `/compras/ordenes-compra/${id}`,
  edit: (id: number | string) => `/compras/ordenes-compra/${id}/editar`,
  pendientes: "/compras/ordenes-compra?estado=PENDIENTE",
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
