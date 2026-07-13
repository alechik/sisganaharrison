export const ANIMAL_ROUTES = {
  list: "/animales",
  create: "/animales/crear",
  deleted: "/animales/eliminados",
  detail: (id: number | string) => `/animales/${id}`,
  edit: (id: number | string) => `/animales/${id}/editar`,
} as const;

export const ANIMAL_DEFAULT_PAGE_SIZE = 10;

export const ANIMAL_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "fecha_nacimiento", label: "Fecha de nacimiento" },
  { value: "created_at", label: "Fecha de creación" },
] as const;

export const ANIMAL_SEXO_OPTIONS = [
  { value: "M", label: "Macho" },
  { value: "H", label: "Hembra" },
] as const;
