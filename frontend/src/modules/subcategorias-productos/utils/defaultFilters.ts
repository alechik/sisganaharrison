import { SUBCATEGORIA_PRODUCTO_DEFAULT_PAGE_SIZE } from "../constants";
import {
  SubcategoriaProductoFilters,
  SubcategoriaProductoSortDirection,
  SubcategoriaProductoSortField,
} from "../types/filters";

export const defaultSubcategoriaProductoFilters = (): SubcategoriaProductoFilters => ({
  search: "",
  activo: undefined,
  categoria_producto_id: undefined,
  sort_by: "nombre" as SubcategoriaProductoSortField,
  sort_dir: "asc" as SubcategoriaProductoSortDirection,
  page: 1,
  per_page: SUBCATEGORIA_PRODUCTO_DEFAULT_PAGE_SIZE,
});
