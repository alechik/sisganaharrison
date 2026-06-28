import { RazaListParams } from "./raza";

export type RazaSortField = "nombre" | "codigo" | "created_at";
export type RazaSortDirection = "asc" | "desc";

export interface RazaFilters extends RazaListParams {
  sort_by: RazaSortField;
  sort_dir: RazaSortDirection;
}
