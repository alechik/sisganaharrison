import { ParcelaListParams } from "./parcela";

export type ParcelaSortField = "nombre" | "codigo" | "created_at";
export type ParcelaSortDirection = "asc" | "desc";

export interface ParcelaFilters extends ParcelaListParams {
  sort_by: ParcelaSortField;
  sort_dir: ParcelaSortDirection;
}
