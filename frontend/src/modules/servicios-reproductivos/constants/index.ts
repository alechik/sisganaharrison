export const TIPO_MONTA_NATURAL = "MONTA_NATURAL";
export const TIPO_INSEMINACION_ARTIFICIAL = "INSEMINACION_ARTIFICIAL";
export const TIPO_TRANSFERENCIA_EMBRION = "TRANSFERENCIA_EMBRION";

export const SERVICIO_REPRODUCTIVO_ROUTES = {
  list: "/servicios-reproductivos",
  montaNatural: "/servicios-reproductivos/monta-natural",
  inseminacionArtificial: "/servicios-reproductivos/inseminacion-artificial",
  create: "/servicios-reproductivos/monta-natural/crear",
  createMontaNatural: "/servicios-reproductivos/monta-natural/crear",
  createInseminacionArtificial: "/servicios-reproductivos/inseminacion-artificial/crear",
  detail: (id: number | string) => `/servicios-reproductivos/${id}`,
  edit: (id: number | string) => `/servicios-reproductivos/${id}/editar`,
  listByTipo: (tipo: string) =>
    tipo === TIPO_INSEMINACION_ARTIFICIAL
      ? "/servicios-reproductivos/inseminacion-artificial"
      : "/servicios-reproductivos/monta-natural",
  createByTipo: (tipo: string) =>
    tipo === TIPO_INSEMINACION_ARTIFICIAL
      ? "/servicios-reproductivos/inseminacion-artificial/crear"
      : "/servicios-reproductivos/monta-natural/crear",
} as const;

export const SERVICIO_REPRODUCTIVO_DEFAULT_PAGE_SIZE = 10;

export const SERVICIO_REPRODUCTIVO_SORT_OPTIONS = [
  { value: "fecha_servicio", label: "Fecha de servicio" },
  { value: "tipo_servicio", label: "Tipo de servicio" },
  { value: "created_at", label: "Fecha de registro" },
] as const;

export const TIPOS_SERVICIO = [
  { value: TIPO_MONTA_NATURAL, label: "Monta natural" },
  { value: TIPO_INSEMINACION_ARTIFICIAL, label: "Inseminación artificial" },
] as const;

export const RESULTADOS_SERVICIO = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PRENADA", label: "Preñada" },
  { value: "VACIA", label: "Vacía" },
  { value: "ABORTO", label: "Aborto" },
] as const;
