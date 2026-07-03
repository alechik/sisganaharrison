import { EstadoProductivoListParams } from "./estadoProductivo";

export type EstadoProductivoSortField = "nombre" | "codigo" | "created_at";
export type EstadoProductivoSortDirection = "asc" | "desc";

export interface EstadoProductivoFilters extends EstadoProductivoListParams {
  sort_by: EstadoProductivoSortField;
  sort_dir: EstadoProductivoSortDirection;
}
