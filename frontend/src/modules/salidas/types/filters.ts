import { SalidaListParams } from "./salida";

export type SalidaSortField = "created_at" | "fecha_salida" | "codigo" | "monto_total";
export type SalidaSortDirection = "asc" | "desc";

export interface SalidaFilters extends SalidaListParams {
  sort_by: SalidaSortField;
  sort_dir: SalidaSortDirection;
}
