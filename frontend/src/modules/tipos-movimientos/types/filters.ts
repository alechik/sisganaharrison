import { TipoMovimientoListParams } from "./tipoMovimiento";

export type TipoMovimientoSortField = "nombre" | "codigo" | "created_at";
export type TipoMovimientoSortDirection = "asc" | "desc";

export interface TipoMovimientoFilters extends TipoMovimientoListParams {
  sort_by: TipoMovimientoSortField;
  sort_dir: TipoMovimientoSortDirection;
}
