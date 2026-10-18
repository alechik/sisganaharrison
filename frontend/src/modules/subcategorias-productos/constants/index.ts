export const SUBCATEGORIA_PRODUCTO_ROUTES = {
  list: "/subcategorias-productos",
  create: "/subcategorias-productos/crear",
  deleted: "/subcategorias-productos/eliminados",
  detail: (id: number | string) => `/subcategorias-productos/${id}`,
  edit: (id: number | string) => `/subcategorias-productos/${id}/editar`,
} as const;

export const SUBCATEGORIA_PRODUCTO_DEFAULT_PAGE_SIZE = 10;

export const SUBCATEGORIA_PRODUCTO_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
