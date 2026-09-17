import { IngresoListParams } from "./ingreso";

export type IngresoSortField = "created_at" | "fecha_ingreso" | "codigo" | "monto_total" | "estado";
export type IngresoSortDirection = "asc" | "desc";

export interface IngresoFilters extends IngresoListParams {
  sort_by: IngresoSortField;
  sort_dir: IngresoSortDirection;
}
