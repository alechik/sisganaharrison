import { PotreroListParams } from "./potrero";

export type PotreroSortField = "nombre" | "codigo" | "created_at";
export type PotreroSortDirection = "asc" | "desc";

export interface PotreroFilters extends PotreroListParams {
  sort_by: PotreroSortField;
  sort_dir: PotreroSortDirection;
}
