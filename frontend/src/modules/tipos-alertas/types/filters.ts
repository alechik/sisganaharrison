import { TipoAlertaListParams } from "./tipoAlerta";

export type TipoAlertaSortField = "nombre" | "codigo" | "created_at";
export type TipoAlertaSortDirection = "asc" | "desc";

export interface TipoAlertaFilters extends TipoAlertaListParams {
  sort_by: TipoAlertaSortField;
  sort_dir: TipoAlertaSortDirection;
}
