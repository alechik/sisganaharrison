import { GrupoListParams } from "./grupo";

export type GrupoSortField = "nombre" | "created_at";
export type GrupoSortDirection = "asc" | "desc";

export interface GrupoFilters extends GrupoListParams {
  sort_by: GrupoSortField;
  sort_dir: GrupoSortDirection;
}
