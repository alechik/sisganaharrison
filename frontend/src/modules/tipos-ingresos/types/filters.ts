import { TipoIngresoListParams } from "./tipoIngreso";

export type TipoIngresoSortField = "nombre" | "codigo" | "iniciales" | "created_at";
export type TipoIngresoSortDirection = "asc" | "desc";

export interface TipoIngresoFilters extends TipoIngresoListParams {
  sort_by: TipoIngresoSortField;
  sort_dir: TipoIngresoSortDirection;
}
