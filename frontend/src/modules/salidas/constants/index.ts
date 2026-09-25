export const SALIDA_ROUTES = {
  list: "/salidas",
  create: "/salidas/crear",
  detail: (id: number | string) => `/salidas/${id}`,
} as const;

export const SALIDA_DEFAULT_PAGE_SIZE = 10;

export const SALIDA_ESTADOS = [{ value: "REGISTRADO", label: "Registrada" }] as const;

export const SALIDA_SORT_OPTIONS = [
  { value: "created_at", label: "Fecha de registro" },
  { value: "fecha_salida", label: "Fecha de salida" },
  { value: "codigo", label: "Código" },
  { value: "monto_total", label: "Monto" },
] as const;
