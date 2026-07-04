import { TipoEventoSanitarioListParams } from "./tipoEventoSanitario";

export type TipoEventoSanitarioSortField = "nombre" | "codigo" | "created_at";
export type TipoEventoSanitarioSortDirection = "asc" | "desc";

export interface TipoEventoSanitarioFilters extends TipoEventoSanitarioListParams {
  sort_by: TipoEventoSanitarioSortField;
  sort_dir: TipoEventoSanitarioSortDirection;
}
