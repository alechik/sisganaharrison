import { AnimalListParams } from "./animal";

export type AnimalSortField = "nombre" | "codigo" | "fecha_nacimiento" | "created_at";
export type AnimalSortDirection = "asc" | "desc";

export interface AnimalFilters extends AnimalListParams {
  sort_by: AnimalSortField;
  sort_dir: AnimalSortDirection;
}
