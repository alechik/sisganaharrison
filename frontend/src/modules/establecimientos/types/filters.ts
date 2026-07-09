import { EstablecimientoListParams } from "./establecimiento";

export type EstablecimientoSortField = "nombre" | "codigo" | "departamento" | "created_at";
export type EstablecimientoSortDirection = "asc" | "desc";

export interface EstablecimientoFilters extends EstablecimientoListParams {
  sort_by: EstablecimientoSortField;
  sort_dir: EstablecimientoSortDirection;
}
