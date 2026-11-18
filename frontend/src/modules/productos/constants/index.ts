export const PRODUCTO_ROUTES = {
  list: "/productos",
  create: "/productos/crear",
  deleted: "/productos/eliminados",
  detail: (id: number | string) => `/productos/${id}`,
  edit: (id: number | string) => `/productos/${id}/editar`,
} as const;

export const PRODUCTO_DEFAULT_PAGE_SIZE = 10;

export const PRODUCTO_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "codigo", label: "Código" },
  { value: "nombre_cientifico", label: "Nombre científico" },
  { value: "precio", label: "Precio" },
  { value: "created_at", label: "Fecha de creación" },
] as const;
