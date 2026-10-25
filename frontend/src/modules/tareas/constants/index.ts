export const TAREA_ROUTES = {
  list: "/tareas",
  create: "/tareas/crear",
  detail: (id: number | string) => `/tareas/${id}`,
  edit: (id: number | string) => `/tareas/${id}/editar`,
} as const;

export const TAREA_DEFAULT_PAGE_SIZE = 10;

export const TAREA_SORT_OPTIONS = [
  { value: "created_at", label: "Fecha de creación" },
  { value: "codigo_tarea", label: "Código" },
  { value: "estado", label: "Estado" },
  { value: "fecha_inicio", label: "Fecha de inicio" },
] as const;

export const TAREA_ESTADO_OPTIONS = [
  { value: "EMITIDO", label: "Emitido" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "TERMINADO", label: "Terminado" },
] as const;
