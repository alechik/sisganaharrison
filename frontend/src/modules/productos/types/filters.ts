import { ProductoListParams } from "./producto";

export type ProductoSortBy = "nombre" | "codigo" | "nombre_cientifico" | "precio" | "created_at";
export type ProductoSortDirection = "asc" | "desc";

export interface ProductoFilters extends ProductoListParams {
  sort_by: ProductoSortBy;
  sort_dir: ProductoSortDirection;
}
