import { PresentacionListParams } from "./presentacion";

export type PresentacionSortField = "descripcion" | "created_at";
export type PresentacionSortDirection = "asc" | "desc";

export interface PresentacionFilters extends PresentacionListParams {
  sort_by: PresentacionSortField;
  sort_dir: PresentacionSortDirection;
}
