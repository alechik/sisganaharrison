import { VentaListParams } from "./venta";

export type VentaSortField =
  | "created_at"
  | "fecha_venta"
  | "cod_venta"
  | "monto_total"
  | "estado";
export type VentaSortDirection = "asc" | "desc";

export interface VentaFilters extends VentaListParams {
  sort_by: VentaSortField;
  sort_dir: VentaSortDirection;
}
