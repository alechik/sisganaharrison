import { CategoriaProductoListParams } from "./categoriaProducto";

export type CategoriaProductoSortField = "nombre" | "created_at";
export type CategoriaProductoSortDirection = "asc" | "desc";

export interface CategoriaProductoFilters extends CategoriaProductoListParams {
  sort_by: CategoriaProductoSortField;
  sort_dir: CategoriaProductoSortDirection;
}
