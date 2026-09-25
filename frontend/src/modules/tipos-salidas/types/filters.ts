import { TipoSalidaListParams } from "./tipoSalida";

export type TipoSalidaSortField = "nombre" | "created_at";
export type TipoSalidaSortDirection = "asc" | "desc";

export interface TipoSalidaFilters extends TipoSalidaListParams {
  sort_by: TipoSalidaSortField;
  sort_dir: TipoSalidaSortDirection;
}
