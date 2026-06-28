export const CATEGORIA_ANIMAL_ROUTES = {
  list: "/categorias-animales",
  create: "/categorias-animales/crear",
  deleted: "/categorias-animales/eliminados",
  detail: (id: number | string) => `/categorias-animales/${id}`,
  edit: (id: number | string) => `/categorias-animales/${id}/editar`,
} as const;

export const CATEGORIA_ANIMAL_DEFAULT_PAGE_SIZE = 10;

export const CATEGORIA_ANIMAL_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
