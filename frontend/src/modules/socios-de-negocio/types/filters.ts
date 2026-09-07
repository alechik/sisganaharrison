import { SocioListParams, TipoPersonaListParams } from "./socio";

export type SocioSortField = "razon_social" | "email" | "fecha_reg" | "created_at";
export type SocioSortDirection = "asc" | "desc";
export type TipoPersonaSortField = "nombre" | "created_at";

export interface SocioFilters extends SocioListParams {
  sort_by: SocioSortField;
  sort_dir: SocioSortDirection;
}

export interface TipoPersonaFilters extends TipoPersonaListParams {
  sort_by: TipoPersonaSortField;
  sort_dir: SocioSortDirection;
}
