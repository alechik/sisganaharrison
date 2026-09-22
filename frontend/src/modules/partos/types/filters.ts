import { PartoListParams } from "./parto";

export type PartoSortField = "fecha_parto" | "estado" | "created_at";
export type PartoSortDirection = "asc" | "desc";

export interface PartoFilters extends PartoListParams {
  sort_by: PartoSortField;
  sort_dir: PartoSortDirection;
}
