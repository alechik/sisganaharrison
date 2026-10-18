import { AlmacenListParams } from "./almacen";

export type AlmacenSortField = "nombre" | "created_at";
export type AlmacenSortDirection = "asc" | "desc";

export interface AlmacenFilters extends AlmacenListParams {
  sort_by: AlmacenSortField;
  sort_dir: AlmacenSortDirection;
}
