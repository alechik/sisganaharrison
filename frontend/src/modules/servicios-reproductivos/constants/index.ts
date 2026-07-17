export const SERVICIO_REPRODUCTIVO_ROUTES = {
  list: "/servicios-reproductivos",
  create: "/servicios-reproductivos/crear",
  detail: (id: number | string) => `/servicios-reproductivos/${id}`,
  edit: (id: number | string) => `/servicios-reproductivos/${id}/editar`,
} as const;

export const SERVICIO_REPRODUCTIVO_DEFAULT_PAGE_SIZE = 10;

export const SERVICIO_REPRODUCTIVO_SORT_OPTIONS = [
  { value: "fecha_servicio", label: "Fecha de servicio" },
  { value: "tipo_servicio", label: "Tipo de servicio" },
  { value: "created_at", label: "Fecha de registro" },
] as const;

export const TIPOS_SERVICIO = [
  { value: "MONTA_NATURAL", label: "Monta natural" },
  { value: "INSEMINACION_ARTIFICIAL", label: "Inseminación artificial" },
  { value: "TRANSFERENCIA_EMBRION", label: "Transferencia de embrión" },
] as const;

export const RESULTADOS_SERVICIO = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PRENADA", label: "Preñada" },
  { value: "VACIA", label: "Vacía" },
  { value: "ABORTO", label: "Aborto" },
] as const;
