import { GestacionListParams } from "./gestacion";

export type GestacionSortField =
  | "fecha_probable_parto"
  | "fecha_confirmacion"
  | "estado"
  | "created_at";
export type GestacionSortDirection = "asc" | "desc";

export interface GestacionFilters extends GestacionListParams {
  sort_by: GestacionSortField;
  sort_dir: GestacionSortDirection;
}
