export const NACIMIENTO_ROUTES = {
  list: "/nacimientos",
  create: "/nacimientos/crear",
  detail: (id: number | string) => `/nacimientos/${id}`,
  edit: (id: number | string) => `/nacimientos/${id}/editar`,
} as const;

export const NACIMIENTO_DEFAULT_PAGE_SIZE = 10;

export const NACIMIENTO_SORT_OPTIONS = [
  { value: "created_at", label: "Fecha de registro" },
  { value: "estado_nacimiento", label: "Estado" },
  { value: "sexo", label: "Sexo" },
  { value: "arete", label: "Arete cría" },
] as const;

export const ESTADOS_NACIMIENTO = [
  { value: "VIVO", label: "Vivo" },
  { value: "MUERTO", label: "Muerto" },
] as const;

export const SEXOS_NACIMIENTO = [
  { value: "M", label: "Macho" },
  { value: "H", label: "Hembra" },
] as const;
