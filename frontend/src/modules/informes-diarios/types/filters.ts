import { InformeDiarioListParams } from "./informeDiario";

export type InformeSortField = "codigo_informe" | "fecha" | "revisado" | "created_at";
export type InformeSortDirection = "asc" | "desc";

export interface InformeDiarioFilters extends InformeDiarioListParams {
  sort_by: InformeSortField;
  sort_dir: InformeSortDirection;
}
