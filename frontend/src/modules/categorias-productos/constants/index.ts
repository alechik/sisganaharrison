export const CATEGORIA_PRODUCTO_ROUTES = {
  list: "/categorias-productos",
  create: "/categorias-productos/crear",
  deleted: "/categorias-productos/eliminados",
  detail: (id: number | string) => `/categorias-productos/${id}`,
  edit: (id: number | string) => `/categorias-productos/${id}/editar`,
} as const;

export const CATEGORIA_PRODUCTO_DEFAULT_PAGE_SIZE = 10;

export const CATEGORIA_PRODUCTO_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
