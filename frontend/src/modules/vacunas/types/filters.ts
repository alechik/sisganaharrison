import { VacunaListParams } from "./vacuna";

export type VacunaSortBy = "nombre" | "codigo" | "laboratorio" | "created_at";
export type VacunaSortDirection = "asc" | "desc";

export interface VacunaFilters extends VacunaListParams {
  sort_by: VacunaSortBy;
  sort_dir: VacunaSortDirection;
}
