import { NacimientoListParams } from "./nacimiento";

export type NacimientoSortField = "created_at" | "estado_nacimiento" | "sexo" | "arete";
export type NacimientoSortDirection = "asc" | "desc";

export interface NacimientoFilters extends NacimientoListParams {
  sort_by: NacimientoSortField;
  sort_dir: NacimientoSortDirection;
}
