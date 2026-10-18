import { SubcategoriaProductoListParams } from "./subcategoriaProducto";

export type SubcategoriaProductoSortField = "nombre" | "created_at";
export type SubcategoriaProductoSortDirection = "asc" | "desc";

export interface SubcategoriaProductoFilters extends SubcategoriaProductoListParams {
  sort_by: SubcategoriaProductoSortField;
  sort_dir: SubcategoriaProductoSortDirection;
}
