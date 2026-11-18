import { ProductoFilters } from "../types";
import { PRODUCTO_DEFAULT_PAGE_SIZE } from "../constants";

export const defaultProductoFilters = (): ProductoFilters => ({
  page: 1,
  per_page: PRODUCTO_DEFAULT_PAGE_SIZE,
  search: "",
  activo: undefined,
  sort_by: "nombre",
  sort_dir: "asc",
});
