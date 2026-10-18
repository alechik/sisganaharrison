import { CATEGORIA_PRODUCTO_DEFAULT_PAGE_SIZE } from "../constants";
import {
  CategoriaProductoFilters,
  CategoriaProductoSortDirection,
  CategoriaProductoSortField,
} from "../types/filters";

export const defaultCategoriaProductoFilters = (): CategoriaProductoFilters => ({
  search: "",
  activo: undefined,
  sort_by: "nombre" as CategoriaProductoSortField,
  sort_dir: "asc" as CategoriaProductoSortDirection,
  page: 1,
  per_page: CATEGORIA_PRODUCTO_DEFAULT_PAGE_SIZE,
});
